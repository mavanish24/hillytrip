import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  MapPin, 
  Tag, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Star, 
  Bell, 
  File, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  AlertTriangle, 
  Check, 
  Plus, 
  RefreshCw, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Info, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VehicleManager from './VehicleManager';
import ServiceCoverage from './ServiceCoverage';
import OperatorQuoteInbox from './OperatorQuoteInbox';
import OperatorProfileManager from './OperatorProfileManager';

interface TaxiDashboardProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  currentPath: string;
}

export default function TaxiDashboard({
  user,
  onUpdateUser,
  navigate,
  currentPath
}: TaxiDashboardProps) {
  // Navigation active tab
  const getActiveTab = () => {
    if (currentPath === '/taxi/dashboard') return 'dashboard';
    const sub = currentPath.substring('/taxi/dashboard/'.length);
    return sub || 'dashboard';
  };
  
  const activeTab = getActiveTab();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI Demo simulation states (Active, Loading, Empty, Error)
  const [uiState, setUiState] = useState<'active' | 'loading' | 'empty' | 'error'>('active');
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'New Quote Request', desc: 'Siliguri NJP to Darjeeling for 4 PAX, SUV', time: '5 mins ago', read: false },
    { id: 'n2', title: 'Booking Confirmed', desc: 'Trip #TR-8821 confirmed by traveler', time: '1 hr ago', read: false },
    { id: 'n3', title: 'Driver Assigned', desc: 'Driver Pemba Bhutia assigned to vehicle WB-74-1294', time: '3 hrs ago', read: true },
    { id: 'n4', title: 'New Review Recieved', desc: '5-star review from Emily S.: "Safe driving!"', time: '1 day ago', read: true },
  ]);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Menu items config
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/taxi/dashboard' },
    { id: 'vehicles', label: 'Vehicles', icon: Car, path: '/taxi/dashboard/vehicles' },
    { id: 'drivers', label: 'Drivers', icon: Users, path: '/taxi/dashboard/drivers' },
    { id: 'service-areas', label: 'Service Coverage', icon: MapPin, path: '/taxi/dashboard/service-areas' },
    { id: 'route-pricing', label: 'Route Pricing', icon: Tag, path: '/taxi/dashboard/route-pricing' },
    { id: 'quote-requests', label: 'Quote Requests', icon: FileText, path: '/taxi/dashboard/quote-requests' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/taxi/dashboard/bookings' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/taxi/dashboard/messages' },
    { id: 'reviews', label: 'Reviews', icon: Star, path: '/taxi/dashboard/reviews' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/taxi/dashboard/notifications', count: unreadNotifsCount },
    { id: 'documents', label: 'Documents', icon: File, path: '/taxi/dashboard/documents' },
    { id: 'profile', label: 'Profile', icon: User, path: '/taxi/dashboard/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/taxi/dashboard/settings' },
  ];

  // Logout handler
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of the Operator Dashboard?')) {
      const updatedUser = { ...user, taxiOperatorStatus: undefined };
      onUpdateUser(updatedUser);
      localStorage.removeItem('hillytrip_user');
      navigate('#/');
    }
  };

  // Reusable Component: UI State Wrapper (Loading, Empty, Error)
  const UIStateWrapper = ({ 
    children, 
    title, 
    emptyTitle = "No records found", 
    emptyDesc = "There are currently no items in this section.",
    errorDesc = "Failed to load connection data. Please check your network or try again.",
    actionLabel,
    onAction
  }: { 
    children: React.ReactNode; 
    title: string;
    emptyTitle?: string;
    emptyDesc?: string;
    errorDesc?: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    if (uiState === 'loading') {
      return (
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
          </div>
          <div className="h-64 bg-slate-150 rounded-3xl"></div>
        </div>
      );
    }

    if (uiState === 'empty') {
      return (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{emptyTitle}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{emptyDesc}</p>
          {actionLabel && onAction && (
            <button 
              onClick={onAction}
              className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              {actionLabel}
            </button>
          )}
        </div>
      );
    }

    if (uiState === 'error') {
      return (
        <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-rose-900 mb-2">Operational Data Sync Error</h3>
          <p className="text-rose-800 text-xs leading-relaxed mb-6">{errorDesc}</p>
          <button 
            onClick={() => setUiState('active')}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Force Re-Sync
          </button>
        </div>
      );
    }

    return <>{children}</>;
  };

  // Reusable Page Header Template
  const PageHeader = ({ 
    title, 
    breadcrumb, 
    actionLabel, 
    onAction 
  }: { 
    title: string; 
    breadcrumb: string; 
    actionLabel?: string; 
    onAction?: () => void; 
  }) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
          <span>Taxi Operator Hub</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-500">{breadcrumb}</span>
        </div>
        <h1 className="text-dash-title text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* State Simulator Controls */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1 text-[11px] font-bold">
          <button 
            onClick={() => setUiState('active')} 
            className={`px-2 py-1 rounded-lg transition-all ${uiState === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setUiState('loading')} 
            className={`px-2 py-1 rounded-lg transition-all ${uiState === 'loading' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Load
          </button>
          <button 
            onClick={() => setUiState('empty')} 
            className={`px-2 py-1 rounded-lg transition-all ${uiState === 'empty' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Empty
          </button>
          <button 
            onClick={() => setUiState('error')} 
            className={`px-2 py-1 rounded-lg transition-all ${uiState === 'error' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Err
          </button>
        </div>

        {actionLabel && onAction && (
          <button 
            onClick={onAction}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {actionLabel}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col relative pb-16 md:pb-0">
      
      {/* 1. TOP NAVBAR HEADER */}
      <header className="bg-slate-900 text-white h-16 px-4 md:px-8 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-900 text-sm">
              HT
            </span>
            <div>
              <span className="font-extrabold text-sm md:text-base tracking-tight block">
                {user?.taxiOperatorDetails?.businessName || "HillyTrip Cabs"}
              </span>
              <div className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Verified Operator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Quick Search placeholder */}
        <div className="hidden lg:flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 w-64 text-xs text-slate-400 focus-within:border-amber-500 transition-all">
          <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search booking ID, vehicle..." 
            className="bg-transparent border-none outline-none w-full text-slate-200 font-semibold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 rounded-xl hover:bg-slate-800 relative transition-all"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifDropdownOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-40 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">Recent Notifications</span>
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-amber-600 hover:text-amber-700 font-bold"
                      >
                        Mark All Read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-slate-50 text-xs hover:bg-slate-50 flex items-start gap-2 ${!n.read ? 'bg-amber-50/20' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                          <div>
                            <p className="font-bold text-slate-800">{n.title}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{n.desc}</p>
                            <span className="text-[9px] text-slate-400 block mt-1 font-medium">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 bg-slate-50 text-center border-t border-slate-100">
                      <button 
                        onClick={() => { navigate('#/taxi/dashboard/notifications'); setNotifDropdownOpen(false); }}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 w-full"
                      >
                        View All notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Profile Menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer" onClick={() => navigate('#/taxi/dashboard/profile')}>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-black text-xs text-amber-400">
              {user?.name?.substring(0, 2).toUpperCase() || "TO"}
            </div>
            <span className="hidden md:inline text-xs font-bold text-slate-200">
              {user?.name || "Operator"}
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* A. SIDEBAR - DESKTOP */}
        <aside className="hidden md:flex w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex-col py-6 justify-between select-none shrink-0">
          <div className="space-y-1.5 px-3">
            <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-3 pl-3">
              Fleet Management
            </span>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate('#' + item.path)}
                  className={`flex items-center justify-between w-full h-10 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black border-amber-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${isActive ? 'bg-slate-950 text-amber-500' : 'bg-amber-500 text-slate-950'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 pt-6 border-t border-slate-800/60">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full h-10 px-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log out Operator</span>
            </button>
          </div>
        </aside>

        {/* B. SIDEBAR - MOBILE (OVERLAY drawer) */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <div className="fixed inset-0 bg-slate-950/60 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)}></div>
              <motion.aside 
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-slate-200 z-50 p-5 flex flex-col justify-between md:hidden shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                    <span className="font-extrabold text-sm text-amber-400 uppercase tracking-widest font-mono">HT Extranet</span>
                    <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto max-h-[75vh]">
                    {menuItems.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { navigate('#' + item.path); setMobileSidebarOpen(false); }}
                          className={`flex items-center justify-between w-full h-10 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {item.count !== undefined && item.count > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-400 text-[9px] font-black">
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full h-10 px-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-all mt-4"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log out Operator</span>
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* C. MAIN CONTENT PORT */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          
          {/* ======================================= */}
          {/* ROUTE 1: DASHBOARD HOME */}
          {/* ======================================= */}
          {activeTab === 'dashboard' && (
            <UIStateWrapper title="Dashboard Overview">
              <PageHeader title="Command Center" breadcrumb="Overview" />
              
              {/* 10 STATS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { title: "Today's Quotes Requested", value: "14", color: "from-blue-500 to-indigo-600", desc: "Awaiting review" },
                  { title: "Pending Quotes Sent", value: "5", color: "from-amber-500 to-yellow-600", desc: "Awaiting user select" },
                  { title: "Accepted Quotes", value: "9", color: "from-emerald-500 to-teal-600", desc: "Converted to booking" },
                  { title: "Active Bookings", value: "4", color: "from-violet-500 to-purple-600", desc: "On the road today" },
                  { title: "Completed Trips", value: "128", color: "from-slate-700 to-slate-900", desc: "All-time conversions" },
                  { title: "Cancelled Trips", value: "2", color: "from-rose-500 to-pink-600", desc: "Unfulfilled contracts" },
                  { title: "Total Vehicle Fleet", value: "8", color: "from-emerald-600 to-green-700", desc: "Registered fleet units" },
                  { title: "Average Trip Rating", value: "4.9", color: "from-amber-400 to-orange-500", desc: "Based on 84 reviews" },
                  { title: "Quote Response Rate", value: "98%", color: "from-cyan-500 to-blue-600", desc: "Avg response 12 mins" },
                  { title: "Operator Accept Rate", value: "94%", color: "from-emerald-500 to-green-600", desc: "Industry benchmark is 85%" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1 leading-tight">{stat.title}</span>
                      <span className="text-card-value text-slate-800 tracking-tight">{stat.value}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed italic block">{stat.desc}</span>
                  </div>
                ))}
              </div>

              {/* TWO COLUMN ROW: QUICK ACTIONS & RECENT ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1 & 2: QUICK ACTIONS & FLEET PROFILE SUMMARY */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* QUICK ACTIONS */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-section-heading text-slate-900 mb-4 flex items-center gap-2">
                      ⚡ Quick Operations Hub
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { title: "Add New Vehicle", desc: "Register heavy commercial or luxury taxi units", path: '/taxi/dashboard/vehicles', icon: Car, color: "bg-amber-500" },
                        { title: "Add Certified Driver", desc: "Vouch for trusted local mountain drivers", path: '/taxi/dashboard/drivers', icon: Users, color: "bg-emerald-500" },
                        { title: "Set Service Areas", desc: "Define base hubs and transit stations", path: '/taxi/dashboard/service-areas', icon: MapPin, color: "bg-blue-500" },
                        { title: "Update Route Rates", desc: "Control localized rates per vehicle class", path: '/taxi/dashboard/route-pricing', icon: Tag, color: "bg-violet-500" },
                        { title: "Check Quote Queries", desc: "Bid on live active Himalayan queries", path: '/taxi/dashboard/quote-requests', icon: FileText, color: "bg-cyan-500" },
                        { title: "Direct Chat inbox", desc: "Communicate directly with booking travelers", path: '/taxi/dashboard/messages', icon: MessageSquare, color: "bg-slate-700" },
                      ].map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => navigate('#' + action.path)}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl p-4 text-left transition-all cursor-pointer hover:shadow-sm"
                        >
                          <div className={`w-8 h-8 ${action.color} text-slate-950 rounded-xl flex items-center justify-center mb-3 shadow-inner`}>
                            <action.icon className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="text-xs font-black text-slate-800 mb-1">{action.title}</h4>
                          <p className="text-slate-400 text-[10px] leading-relaxed">{action.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INFO BANNER */}
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm mb-1">Pre-season Mountain Safety Certification Active</h4>
                      <p className="text-xs text-amber-50/90 leading-relaxed">
                        HillyTrip is validating monsoon road safety logs for all high-altitude routes. Ensure your driver documents and vehicle commercial road permits are updated to avoid dispatch locks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: RECENT ACTIVITY TIMELINE */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-section-heading text-slate-900 mb-4 flex items-center gap-2">
                      🕒 Recent Activities
                    </h3>
                    <div className="space-y-4">
                      {[
                        { title: "New Quote Request", desc: "Bagdogra to Mirik Lake, Bolero", time: "10 mins ago", color: "bg-blue-500" },
                        { title: "Booking #TR-8821 Confirmed", desc: "Assigned vehicle Innova WB-74-1294", time: "1 hr ago", color: "bg-emerald-500" },
                        { title: "Driver Assigned to Trip", desc: "Pemba Bhutia assigned for Siliguri run", time: "3 hrs ago", color: "bg-indigo-500" },
                        { title: "New traveler Review", desc: "Emily S. left 5 stars for Bagdogra trip", time: "1 day ago", color: "bg-amber-500" },
                        { title: "Vehicle Document Updated", desc: "Fitness permit uploaded for vehicle WB-74-8891", time: "2 days ago", color: "bg-violet-500" },
                      ].map((activity, idx) => (
                        <div key={idx} className="flex gap-3 text-xs">
                          <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${activity.color} shrink-0 mt-1`}></div>
                            {idx < 4 && <div className="w-0.5 bg-slate-100 flex-1 my-1"></div>}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{activity.title}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">{activity.desc}</p>
                            <span className="text-[9px] text-slate-400 font-mono block mt-1">{activity.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 2: VEHICLES CATALOG */}
          {/* ======================================= */}
          {activeTab === 'vehicles' && (
            <VehicleManager user={user} onUpdateUser={onUpdateUser} />
          )}

          {/* ======================================= */}
          {/* ROUTE 3: DRIVERS CATALOG */}
          {/* ======================================= */}
          {activeTab === 'drivers' && (
            <UIStateWrapper 
              title="Driver Directory"
              emptyTitle="No drivers verified"
              emptyDesc="Ensure you register verified, licensed mountain drivers for Darjeeling & Sikkim navigation."
              actionLabel="Add Driver"
              onAction={() => alert('Driver registration module will be implemented in the next phase.')}
            >
              <PageHeader 
                title="Verified Mountain Drivers" 
                breadcrumb="Drivers" 
                actionLabel="Add Driver" 
                onAction={() => alert('Driver registration module will be implemented in the next phase.')} 
              />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Certified Operators Drivers</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {[
                    { name: "Pemba Bhutia", phone: "+91 98322 12948", license: "DL-74-20188821", experience: "12 Years Hill Driving", status: "On Duty", rating: "4.9", vehicle: "Toyota Innova (WB-74-1294)" },
                    { name: "Tshering Sherpa", phone: "+91 94745 88910", license: "DL-74-20159932", experience: "8 Years Hill Driving", status: "Available", rating: "4.8", vehicle: "Mahindra Bolero (WB-74-8891)" },
                    { name: "Rajesh Pradhan", phone: "+91 88329 11094", license: "DL-04-20202219", experience: "6 Years Hill Driving", status: "Offline", rating: "4.7", vehicle: "Tata Sumo (SK-04-3321)" },
                  ].map((driver, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{driver.name}</h4>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] px-2 py-0.5 rounded font-black tracking-wider block mt-1 uppercase w-max">
                              ● Verified Hill Pro
                            </span>
                          </div>
                          <span className="text-amber-500 font-extrabold flex items-center gap-0.5 text-xs bg-amber-50 px-2 py-0.5 rounded-lg">
                            <Star className="w-3 h-3 fill-amber-400" /> {driver.rating}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-500 border-t border-slate-150 pt-3 mt-3">
                          <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1 block sm:inline">Phone:</span> {driver.phone}</p>
                          <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1 block sm:inline">License:</span> <span className="font-mono font-semibold">{driver.license}</span></p>
                          <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1 block sm:inline">Route exp:</span> {driver.experience}</p>
                          <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1 block sm:inline">Vehicle:</span> <span className="text-slate-800 font-bold">{driver.vehicle}</span></p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${driver.status === 'On Duty' ? 'bg-indigo-100 text-indigo-800' : driver.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                          {driver.status}
                        </span>
                        <button className="text-[11px] text-slate-500 hover:text-slate-900 font-bold underline cursor-pointer">Edit Documents</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 4: SERVICE AREAS */}
          {/* ======================================= */}
          {activeTab === 'service-areas' && (
            <ServiceCoverage user={user} onUpdateUser={onUpdateUser} />
          )}

          {/* ======================================= */}
          {/* ROUTE 5: ROUTE PRICING */}
          {/* ======================================= */}
          {activeTab === 'route-pricing' && (
            <UIStateWrapper title="Route Pricing Grid">
              <PageHeader 
                title="Route Pricing Matrix" 
                breadcrumb="Pricing" 
                actionLabel="Update Pricing Rules"
                onAction={() => alert('Pricing rules configuration is launching in next phase.')}
              />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Himalayan Corridor Base Fares</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                        <th className="p-4">Route Corridor</th>
                        <th className="p-4">Est. Distance</th>
                        <th className="p-4">Base Rate (SUV 8-Seater)</th>
                        <th className="p-4">Base Rate (Luxury Innova)</th>
                        <th className="p-4">Hill Permit Fee</th>
                        <th className="p-4">Peak Season Surcharge</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                      {[
                        { route: "Siliguri NJP ⇄ Darjeeling Town", dist: "74 Kms", suv: "₹ 3,200", lux: "₹ 4,500", permit: "Included", peak: "15%", status: "Active" },
                        { route: "Bagdogra Airport ⇄ Gangtok (Sikkim)", dist: "124 Kms", suv: "₹ 4,800", lux: "₹ 6,500", permit: "₹ 500 Extra", peak: "20%", status: "Active" },
                        { route: "Darjeeling ⇄ Kalimpong", dist: "52 Kms", suv: "₹ 2,800", lux: "₹ 3,800", permit: "Included", peak: "10%", status: "Active" },
                        { route: "Siliguri NJP ⇄ Mirik Lake Run", dist: "48 Kms", suv: "₹ 2,500", lux: "₹ 3,500", permit: "Included", peak: "10%", status: "Active" },
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-4 font-black text-slate-900">{r.route}</td>
                          <td className="p-4 font-bold text-slate-400">{r.dist}</td>
                          <td className="p-4 font-mono font-bold text-slate-800">{r.suv}</td>
                          <td className="p-4 font-mono font-bold text-emerald-700">{r.lux}</td>
                          <td className="p-4 text-[11px] font-bold text-slate-500">{r.permit}</td>
                          <td className="p-4 text-amber-600 font-extrabold">{r.peak}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-black">
                              ● {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 6: QUOTE REQUESTS */}
          {/* ======================================= */}
          {activeTab === 'quote-requests' && (
            <OperatorQuoteInbox 
              user={user}
              onUpdateUser={onUpdateUser}
            />
          )}

          {/* ======================================= */}
          {/* ROUTE 7: BOOKINGS LIST */}
          {/* ======================================= */}
          {activeTab === 'bookings' && (
            <UIStateWrapper 
              title="Trip Bookings"
              emptyTitle="No confirmed bookings yet"
              emptyDesc="When travelers accept your bids, the bookings will display here with driver dispatcher options."
            >
              <PageHeader title="Confirmed Trip Bookings" breadcrumb="Bookings" />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Confirmed Fleet runs</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                        <th className="p-4">Booking ID</th>
                        <th className="p-4">Traveler Name</th>
                        <th className="p-4">Corridor Route</th>
                        <th className="p-4">Travel Date</th>
                        <th className="p-4">Assigned Vehicle / Driver</th>
                        <th className="p-4">Fare Total</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                      {[
                        { id: "BK-8821", name: "David Miller", route: "NJP Station ⇄ Darjeeling", date: "15-Jul-2026", unit: "Innova Crysta (WB-74-1294)", driver: "Pemba Bhutia", fare: "₹ 4,500", pay: "Paid Online", status: "Confirmed", color: "bg-emerald-100 text-emerald-800" },
                        { id: "BK-8809", name: "Sunita Sen", route: "Bagdogra Airport ⇄ Gangtok", date: "18-Jul-2026", unit: "Tata Sumo (SK-04-3321)", driver: "Rajesh Pradhan", fare: "₹ 5,300", pay: "Pay on Arrival", status: "Assigned", color: "bg-indigo-100 text-indigo-800" },
                        { id: "BK-8756", name: "Nitin Gadkari", route: "Siliguri ⇄ Kalimpong Run", date: "24-Jul-2026", unit: "Mahindra Bolero (Unassigned)", driver: "Unassigned", fare: "₹ 2,800", pay: "Deposit Paid", status: "Driver Pending", color: "bg-amber-100 text-amber-800" },
                      ].map((b, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-4 font-mono font-black text-slate-900">{b.id}</td>
                          <td className="p-4 font-bold text-slate-800">{b.name}</td>
                          <td className="p-4 font-extrabold text-slate-700">{b.route}</td>
                          <td className="p-4">{b.date}</td>
                          <td className="p-4 text-[11px]">
                            <p className="font-extrabold text-slate-800">{b.unit}</p>
                            <p className="text-slate-400 font-medium">Driver: {b.driver}</p>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-900">{b.fare}</td>
                          <td className="p-4 text-[11px] font-bold text-slate-500">{b.pay}</td>
                          <td className="p-4 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${b.color}`}>
                              ● {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 8: MESSAGES CHAT */}
          {/* ======================================= */}
          {activeTab === 'messages' && (
            <UIStateWrapper title="Direct Chat inbox">
              <PageHeader title="Traveler Inbox Messages" breadcrumb="Messages" />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-120">
                {/* Conversations List sidebar */}
                <div className="w-full md:w-80 border-r border-slate-100 flex flex-col shrink-0 select-none">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Conversations</span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {[
                      { name: "Anupam Roy", id: "BK-8821", text: "Can we stop at Kurseong on the way for tea?", time: "5 mins ago", active: true },
                      { name: "Sunita Sen", id: "BK-8809", text: "Thanks, I will pay the driver on arrival.", time: "1 hr ago", active: false },
                      { name: "David Miller", id: "QR-0982", text: "Is the road to Darjeeling clear from landslides?", time: "1 day ago", active: false },
                    ].map((chat, i) => (
                      <div key={i} className={`p-4 hover:bg-slate-50/50 transition-all cursor-pointer flex gap-2 text-xs ${chat.active ? 'bg-amber-50/30 border-l-4 border-amber-500' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-extrabold text-slate-700">
                          {chat.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 block truncate">{chat.name}</span>
                            <span className="text-[9px] text-slate-400 font-medium shrink-0">{chat.time}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold block">{chat.id}</span>
                          <p className="text-[11px] text-slate-500 mt-1 truncate">{chat.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversation Chat window */}
                <div className="flex-1 flex flex-col justify-between bg-slate-50/50">
                  <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">Dr. Anupam Roy</span>
                      <span className="text-[10px] text-slate-400 block font-bold">Booking ID: BK-8821</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      ● Active Traveler
                    </span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    <div className="flex justify-start text-xs max-w-sm">
                      <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-slate-700">
                        <p className="leading-relaxed">Hi, is the Bolero SUV comfortable enough for senior citizens? We are traveling to Darjeeling.</p>
                        <span className="text-[9px] text-slate-400 block mt-1 font-medium">10:15 AM</span>
                      </div>
                    </div>

                    <div className="flex justify-end text-xs max-w-sm ml-auto">
                      <div className="bg-slate-900 text-white p-3 rounded-2xl rounded-tr-none shadow-sm">
                        <p className="leading-relaxed">Hello Dr. Roy! Yes, we have premium leather seats and high clearance for hill travel. Driver Pemba is very gentle and specialized for senior travelers.</p>
                        <span className="text-[9px] text-slate-400 block mt-1 font-mono">10:18 AM</span>
                      </div>
                    </div>

                    <div className="flex justify-start text-xs max-w-sm">
                      <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-slate-700">
                        <p className="leading-relaxed">Can we stop at Kurseong on the way for tea? There is a nice tea estate there.</p>
                        <span className="text-[9px] text-slate-400 block mt-1 font-medium">5 mins ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Type your message..." 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500 font-semibold"
                    />
                    <button className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 9: REVIEWS */}
          {/* ======================================= */}
          {activeTab === 'reviews' && (
            <UIStateWrapper title="Operator Reviews">
              <PageHeader title="Traveler Feedback & Reviews" breadcrumb="Reviews" />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
                  <div className="text-center shrink-0">
                    <span className="text-4xl font-black text-slate-900">4.9</span>
                    <div className="flex justify-center gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map(x => <Star key={x} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">84 Reviews Received</span>
                  </div>
                  <div className="flex-1 w-full space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-12 block font-bold">5 Stars</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[94%] h-full bg-amber-400 rounded-full"></div></div>
                      <span className="w-8 text-right font-mono font-bold">94%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 block font-bold">4 Stars</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[5%] h-full bg-amber-400 rounded-full"></div></div>
                      <span className="w-8 text-right font-mono font-bold">5%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 block font-bold">3 Stars</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[1%] h-full bg-amber-400 rounded-full"></div></div>
                      <span className="w-8 text-right font-mono font-bold">1%</span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {[
                    { author: "Emily Watson", route: "Bagdogra to Kurseong", rating: 5, comment: "Excellent driving! Roads were narrow and steep, but the driver Pemba Bhutia navigated safely. Innova was very neat and tidy.", date: "July 10, 2026", reply: "Thank you Emily! We strive for mountain safety." },
                    { author: "Manish Dev", route: "NJP to Gangtok run", rating: 5, comment: "Tshering was early at NJP Station. The SUV was fully disinfected. He helped with heavy mountain permits. Highly recommended taxi operators.", date: "July 05, 2026", reply: null },
                  ].map((rev, i) => (
                    <div key={i} className="py-5 first:pt-0 last:pb-0 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-extrabold text-slate-900 block">{rev.author}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{rev.route}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-0.5 justify-end mb-0.5">
                            {Array.from({ length: rev.rating }).map((_, idx) => (
                              <Star key={idx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">{rev.date}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-semibold italic">"{rev.comment}"</p>
                      {rev.reply ? (
                        <div className="mt-3 bg-slate-50 border-l-4 border-slate-300 rounded-r-xl p-3 text-slate-500">
                          <p><strong className="text-slate-700">Response from Owner:</strong> {rev.reply}</p>
                        </div>
                      ) : (
                        <button 
                          onClick={() => alert(`Post reply to ${rev.author}`)}
                          className="mt-3 text-amber-600 hover:text-amber-700 font-black cursor-pointer underline block"
                        >
                          Write Reply Response
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 10: NOTIFICATIONS */}
          {/* ======================================= */}
          {activeTab === 'notifications' && (
            <UIStateWrapper title="Full Notifications">
              <PageHeader 
                title="Notifications Log" 
                breadcrumb="Notifications" 
                actionLabel="Mark All as Read"
                onAction={handleMarkAllRead}
              />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
                <div className="space-y-4">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-2xl border flex items-start gap-3 text-xs transition-all ${!n.read ? 'bg-amber-50/10 border-amber-100' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <div className="flex-1">
                        <p className="font-extrabold text-slate-800">{n.title}</p>
                        <p className="text-slate-500 mt-1 leading-relaxed">{n.desc}</p>
                        <span className="text-[9px] text-slate-400 block mt-2 font-mono">{n.time}</span>
                      </div>
                      {!n.read && (
                        <button 
                          onClick={() => {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                          }}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 11: DOCUMENTS */}
          {/* ======================================= */}
          {activeTab === 'documents' && (
            <UIStateWrapper title="Administrative Documents">
              <PageHeader title="Operator Documents & Permits" breadcrumb="Documents" />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-100 text-xs text-amber-800 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <strong className="block mb-0.5">Documents verified for HillyTrip commercial listing</strong>
                    <span>These files were vetted during your operator onboarding request. Maintain current expiration validity of vehicle licensing logs.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Owner ID Proof (Aadhaar/Passport)", status: "Approved & Active", code: "ID_OWNER_PROVED", date: "Verified 12-Jul-2026" },
                    { label: "Business Address Proof (Trade License)", status: "Approved & Active", code: "TRADE_LIC_ACTIVE", date: "Verified 12-Jul-2026" },
                    { label: "Commercial Vehicle Fleet Permits", status: "Approved & Active", code: "FLEET_COMMERCIAL_PROVED", date: "Verified 12-Jul-2026" },
                    { label: "Driver Background Clearances", status: "Reviewing (Pending)", code: "DRIVER_VET_QUEUE", date: "Submitted 12-Jul-2026", pending: true },
                  ].map((doc, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-extrabold text-slate-800 mb-1">{doc.label}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block">Code: {doc.code}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">{doc.date}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${doc.pending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 12: PROFILE */}
          {/* ======================================= */}
          {activeTab === 'profile' && (
            <UIStateWrapper title="Operator Profile">
              <PageHeader 
                title="Business Settings Profile" 
                breadcrumb="Profile" 
              />
              <div className="max-w-4xl mx-auto">
                <OperatorProfileManager user={user} onUpdateUser={onUpdateUser} />
              </div>
            </UIStateWrapper>
          )}

          {/* ======================================= */}
          {/* ROUTE 13: SETTINGS */}
          {/* ======================================= */}
          {activeTab === 'settings' && (
            <UIStateWrapper title="Dashboard Settings">
              <PageHeader title="Operator Portal Settings" breadcrumb="Settings" />
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-2">Notification Preferences</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">Control which channels you receive live quotation bid requests and booking alert alerts.</p>
                  <div className="space-y-3 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-amber-500 accent-amber-500 focus:ring-amber-400" />
                      <span>Live WhatsApp Alert notifications (Quote requests & Booking confirmations)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-amber-500 accent-amber-500 focus:ring-amber-400" />
                      <span>Email Digest notifications (Daily statistics & payouts summary)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-amber-500 accent-amber-500 focus:ring-amber-400" />
                      <span>Sound alerts on browser when new traveler bidding query arrives</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-extrabold text-slate-900 mb-2">Automated Quote Bidding (Simulation Only)</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">Set automatic bidding limits based on standard route pricing matrices.</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input type="checkbox" className="w-4 h-4 text-amber-500 accent-amber-500 focus:ring-amber-400" />
                    <span>Enable smart auto-quoting using base route tariffs</span>
                  </div>
                </div>
              </div>
            </UIStateWrapper>
          )}

        </main>
      </div>

      {/* 3. MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around text-slate-400 select-none z-40">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/taxi/dashboard' },
          { id: 'vehicles', label: 'Vehicles', icon: Car, path: '/taxi/dashboard/vehicles' },
          { id: 'quote-requests', label: 'Bidding', icon: FileText, path: '/taxi/dashboard/quote-requests' },
          { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/taxi/dashboard/bookings' },
          { id: 'profile', label: 'Profile', icon: User, path: '/taxi/dashboard/profile' },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate('#' + item.path)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${isActive ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
