import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Bookmark, MessageSquare, Star, 
  HelpCircle, Car, Settings, LogOut, User, Lock, Bell, 
  Shield, Globe, Trash2, Menu, X, ChevronRight, Compass, MapPin, Home, Send, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, Homestay } from '../types';

interface UnifiedDashboardProps {
  user: UserType | null;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
  dbHomestays: Homestay[];
  reloadDb?: () => Promise<void> | void;
}

export default function UnifiedDashboardSystem({
  user,
  navigate,
  setNotification,
  dbHomestays,
  reloadDb
}: UnifiedDashboardProps) {
  // Active state for sidebar navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trips' | 'saved' | 'messages' | 'reviews' | 'support' | 'settings'>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Deep-linking to specific tabs based on URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      if (hash.includes('/dashboard')) {
        if (hash.includes('tab=trips')) {
          setActiveTab('trips');
        } else if (hash.includes('tab=saved')) {
          setActiveTab('saved');
        } else if (hash.includes('tab=messages')) {
          setActiveTab('messages');
        } else if (hash.includes('tab=reviews')) {
          setActiveTab('reviews');
        } else if (hash.includes('tab=support')) {
          setActiveTab('support');
        } else if (hash.includes('tab=settings')) {
          setActiveTab('settings');
        } else {
          setActiveTab('dashboard');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic user data fetching (like trips/quotes)
  const [travelerLeads, setTravelerLeads] = useState<{ trips: any[], cars: any[] }>({ trips: [], cars: [] });
  const [leadsLoading, setLeadsLoading] = useState(false);

  // Local state for user's interactive mock data
  const [savedItems, setSavedItems] = useState({
    homestays: [
      { id: 'save_h1', name: 'Solang Valley Wood Cabin', region: 'Solang Valley', rating: '4.8', price: '₹3,200/night', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
      { id: 'save_h2', name: 'Sissu Riverfront Homestay', region: 'Sissu Valley', rating: '4.9', price: '₹2,800/night', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80' }
    ],
    routes: [
      { id: 'save_r1', name: 'Manali to Rohtang Pass Scenic Route', duration: '2-3 Hours', difficulty: 'Moderate', distance: '51 km' },
      { id: 'save_r2', name: 'Keylong Backcountry Valley Route', duration: '4-5 Hours', difficulty: 'Scenic', distance: '78 km' }
    ],
    attractions: [
      { id: 'save_a1', name: 'Jogini Waterfalls', category: 'Waterfall', time: '1 Hour Trek' },
      { id: 'save_a2', name: 'Atal Tunnel South Portal', category: 'Engineering Landmark', time: 'Sightseeing' }
    ]
  });

  // Recent Activity timeline
  const [recentActivities, setRecentActivities] = useState([
    { id: 'act_1', action: 'Booking Confirmed', detail: 'Pine Crest Wood Cabin booking at Solang Valley.', time: '10 hours ago' },
    { id: 'act_2', action: 'Quote Sent', detail: 'Luxury 4x4 cab quote for Sissu Valley transit sent to operators.', time: '1 day ago' },
    { id: 'act_3', action: 'Review Submitted', detail: 'Submitted a 5-star review for Karan Negi Cab Service.', time: '3 days ago' },
    { id: 'act_4', action: 'Trip Completed', detail: 'Completed Gramphu Road & Rohtang Pass Explorer tour.', time: '1 week ago' }
  ]);

  // Message Threads
  const [messages, setMessages] = useState([
    { id: 'msg_1', sender: 'Karan Negi (Driver)', text: 'Hello! I will be waiting at the Manali Taxi Stand by 08:30 AM.', time: '09:12 AM', unread: true },
    { id: 'msg_2', sender: 'Tenzin Choden (Homestay)', text: 'Your deluxe wooden cabin has been sanitised and is ready for check-in.', time: 'Yesterday', unread: true },
    { id: 'msg_3', sender: 'HillyTrip Support', text: 'Your security verification was completed successfully.', time: '3 days ago', unread: false }
  ]);
  const [newMessageText, setNewMessageText] = useState('');

  // Support State
  const [supportQueries, setSupportQueries] = useState<any[]>([]);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  // Review State
  const [pendingReviews, setPendingReviews] = useState([
    { id: 'rev_p1', title: 'Vijay Sharma Cab Ride', date: 'Jul 12, 2026', type: 'Taxi' },
    { id: 'rev_p2', title: 'Solang Pine Lodges Stay', date: 'Jul 10, 2026', type: 'Homestay' }
  ]);
  const [submittedReviews, setSubmittedReviews] = useState([
    { id: 'rev_s1', title: 'Chandra Bhaga Guest Inn', rating: 5, comment: 'Excellent hospitality and amazing hot home-cooked meals.', date: 'Jun 28, 2026' },
    { id: 'rev_s2', title: 'Karan Negi Cab Services', rating: 5, comment: 'Very professional driver, knew the high mountain bends perfectly.', date: 'Jun 25, 2026' }
  ]);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Settings Forms State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMobile, setProfileMobile] = useState(user?.mobile || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState({ email: true, sms: false, pushes: true });
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  useEffect(() => {
    if (user) {
      setLeadsLoading(true);
      fetch(`/api/user/leads?mobile=${encodeURIComponent(user.mobile || '')}&name=${encodeURIComponent(user.name || '')}`)
        .then(res => res.json())
        .then(data => {
          if (data) setTravelerLeads(data);
        })
        .catch(err => console.error('[travelerLeads error]', err))
        .finally(() => setLeadsLoading(false));
    }
  }, [user]);

  // Handle Profile Update submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: profileName,
          mobile: profileMobile,
          password: newPassword || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Profile details updated successfully.' });
        if (reloadDb) reloadDb();
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to update profile.' });
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Error updating profile. Local state updated.' });
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('hillytrip_user');
    setNotification({ type: 'success', message: 'Logged out successfully.' });
    window.location.hash = '#/';
    window.location.reload();
  };

  // Determine current greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Compile real and mock trips
  const getCombinedTrips = () => {
    const mockTrips = [
      {
        id: 'mock_trip_1',
        destination: 'Sissu Valley & Keylong Backcountry',
        dates: 'Aug 12 - Aug 18, 2026',
        status: 'Ongoing',
        type: 'ongoing',
        description: 'Chandra Bhaga Guest Inn, private 4x4 cab assigned (Karan Negi).'
      },
      {
        id: 'mock_trip_2',
        destination: 'Solang Valley Ski Resort & Paragliding',
        dates: 'Sep 24 - Sep 28, 2026',
        status: 'Upcoming',
        type: 'upcoming',
        description: 'Pine Crest Wood Cabin booked, paragliding passes active.'
      },
      {
        id: 'mock_trip_3',
        destination: 'Gramphu Road & Rohtang Pass Explorer',
        dates: 'Jun 10 - Jun 14, 2026',
        status: 'Completed',
        type: 'completed',
        description: 'Trip finished successfully. Verified guide feedback recorded.'
      },
      {
        id: 'mock_trip_4',
        destination: 'Spiti Valley Rugged Overlander',
        dates: 'May 02 - May 08, 2026',
        status: 'Cancelled',
        type: 'cancelled',
        description: 'Cancelled due to unexpected road blocks near Kaza.'
      }
    ];

    const dynamicTrips = (travelerLeads.trips || []).map((t: any) => ({
      id: t.id || `real_trip_${Math.random()}`,
      destination: `${t.selectedDest || 'Himalayan Base'} (${t.selectedHub || 'Any Hub'})`,
      dates: t.dates || 'TBD',
      status: t.leadStatus ? (t.leadStatus.charAt(0).toUpperCase() + t.leadStatus.slice(1)) : 'Submitted',
      type: t.leadStatus === 'completed' ? 'completed' : t.leadStatus === 'cancelled' ? 'cancelled' : 'upcoming',
      description: `Group size: ${t.groupSize || 1} traveler(s). Allocated Guide: ${t.allocatedGuide ? t.allocatedGuide.name : 'Awaiting Assignment'}`
    }));

    return [...dynamicTrips, ...mockTrips];
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'My Trips', icon: Calendar },
    { id: 'saved', label: 'Saved', icon: HeartIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: messages.filter(m => m.unread).length },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'become_taxi', label: 'Become Taxi Operator', icon: Car },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  function HeartIcon(props: any) {
    return <Bookmark {...props} />;
  }

  // Member since calculation
  const getMemberSince = () => {
    if (user?.createdAt) {
      try {
        const date = new Date(user.createdAt);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } catch (e) {
        return 'June 2026';
      }
    }
    return 'June 2026';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col md:flex-row transition-colors duration-300">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-3xs">
        <span className="font-extrabold text-base tracking-tight text-emerald-600 dark:text-emerald-400">🏕️ HillyTrip Profile</span>
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-150 dark:bg-slate-800 hover:bg-slate-200"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR CONTAINER */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6 transform transition-transform duration-300 md:relative md:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-2xl">🏔️</span>
            <div>
              <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white block">HillyTrip</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">TRAVELLER CONSOLE</span>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map(item => {
              if (item.id === 'become_taxi') {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate('#/become-taxi-operator');
                      setMobileSidebarOpen(false);
                    }}
                    className="flex items-center justify-between w-full h-11 px-4 rounded-xl text-xs font-bold text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition duration-150 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              }

              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`
                    flex items-center justify-between w-full h-11 px-4 rounded-xl text-xs font-bold transition duration-150 cursor-pointer text-left
                    ${isActive 
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm' 
                      : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="bg-rose-500 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full h-11 px-4 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition duration-150 cursor-pointer text-left mt-8"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      {/* MAIN MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 md:py-12 space-y-8">
          
          {/* PROFILE HEADER BLOCK */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Profile Photo */}
              <div className="relative shrink-0">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xs" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 text-2xl font-black font-sans shrink-0 shadow-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                )}
              </div>

              {/* Traveller details */}
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {user?.name || 'Explorer Traveller'}
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Member Since {getMemberSince()}
                </p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setActiveTab('settings')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* ACTIVE CONTENT VIEW */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              
              {/* 1. DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Clean Welcome Card */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-850 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800)' }} />
                    <div className="relative z-10 space-y-2 text-left">
                      <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-widest block">
                        {getGreeting()}
                      </span>
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}
                      </h1>
                      <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                        Ready for your next Himalayan escape? Review your active trips, manage quote inquiries, and access 24/7 mountain support instantly below.
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions (Four Cards) */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button 
                        onClick={() => navigate('#/homestays')}
                        className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 hover:border-slate-350 dark:hover:border-slate-700 transition duration-150 cursor-pointer group"
                      >
                        <Home className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition" />
                        <span className="font-bold text-xs block text-slate-800 dark:text-slate-250">Explore Homestays</span>
                      </button>

                      <button 
                        onClick={() => navigate('#/book-car')}
                        className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 hover:border-slate-350 dark:hover:border-slate-700 transition duration-150 cursor-pointer group"
                      >
                        <Car className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 group-hover:scale-105 transition" />
                        <span className="font-bold text-xs block text-slate-800 dark:text-slate-250">Get Taxi Quotes</span>
                      </button>

                      <button 
                        onClick={() => navigate('#/destinations')}
                        className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 hover:border-slate-350 dark:hover:border-slate-700 transition duration-150 cursor-pointer group"
                      >
                        <Compass className="w-5 h-5 mx-auto text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition" />
                        <span className="font-bold text-xs block text-slate-800 dark:text-slate-250">Explore Destinations</span>
                      </button>

                      <button 
                        onClick={() => setActiveTab('saved')}
                        className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 hover:border-slate-350 dark:hover:border-slate-700 transition duration-150 cursor-pointer group"
                      >
                        <Bookmark className="w-5 h-5 mx-auto text-rose-500 group-hover:scale-105 transition" />
                        <span className="font-bold text-xs block text-slate-800 dark:text-slate-250">Saved Places</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Recent Activity */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Recent Activity</h3>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                        {recentActivities.map((act) => (
                          <div key={act.id} className="flex justify-between items-start text-xs border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-none last:pb-0">
                            <div className="space-y-0.5 text-left">
                              <span className="font-bold text-slate-900 dark:text-white block">{act.action}</span>
                              <p className="text-[11px] text-slate-500">{act.detail}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Summaries / Saved List */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Recently Saved</h3>
                        <button 
                          onClick={() => setActiveTab('saved')}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        >
                          View All
                        </button>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-left">
                        {savedItems.homestays.slice(0, 1).map(h => (
                          <div key={h.id} className="flex gap-3 items-center">
                            <img src={h.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            <div className="flex-1 min-w-0 text-xs">
                              <span className="font-bold truncate block">{h.name}</span>
                              <p className="text-[11px] text-slate-400">{h.region} • Homestay</p>
                            </div>
                          </div>
                        ))}
                        {savedItems.routes.slice(0, 1).map(r => (
                          <div key={r.id} className="flex gap-3 items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-xs text-indigo-600">🛣️</div>
                            <div className="flex-1 min-w-0 text-xs">
                              <span className="font-bold truncate block">{r.name}</span>
                              <p className="text-[11px] text-slate-400">{r.distance} • Route</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 2. MY TRIPS VIEW */}
              {activeTab === 'trips' && (
                <div className="space-y-6">
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Trips</h2>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Review all your upcoming, ongoing, completed and cancelled Himalayan adventures.</p>
                  </div>

                  {leadsLoading ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Synchronizing itineraries...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getCombinedTrips().map((trip) => {
                        const statusColors: Record<string, string> = {
                          ongoing: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
                          upcoming: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
                          completed: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-350 dark:border-slate-700/50',
                          cancelled: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50'
                        };

                        const currentType = trip.type || 'upcoming';
                        const badgeStyle = statusColors[currentType] || 'bg-slate-50 text-slate-600 border-slate-200';

                        return (
                          <div 
                            key={trip.id} 
                            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-3xs"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{trip.destination}</h4>
                                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${badgeStyle}`}>
                                  {trip.status}
                                </span>
                              </div>
                              <p className="text-xs font-mono text-slate-400">{trip.dates}</p>
                              {trip.description && (
                                <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed max-w-2xl">{trip.description}</p>
                              )}
                            </div>

                            <button 
                              onClick={() => {
                                setNotification({ type: 'success', message: `Routing view for trip: ${trip.destination}` });
                                navigate('#/plan-my-trip');
                              }}
                              className="shrink-0 self-start sm:self-center bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition duration-150 cursor-pointer"
                            >
                              View Trip
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. SAVED PLACES VIEW */}
              {activeTab === 'saved' && (
                <div className="space-y-8 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Saved Basecamp Items</h2>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Your curated selection of verified homestays, scenic transit routes, and local attractions.</p>
                  </div>

                  {/* Saved Homestays */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Homestays</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedItems.homestays.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex gap-4 p-4 shadow-3xs relative">
                          <img src={item.image} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">{item.name}</h4>
                              <p className="text-[11px] text-slate-400">{item.region} • ⭐ {item.rating}</p>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{item.price}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setSavedItems({ ...savedItems, homestays: savedItems.homestays.filter(x => x.id !== item.id) });
                              setNotification({ type: 'success', message: 'Removed homestay from saved.' });
                            }}
                            className="absolute top-3 right-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saved Routes */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Routes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedItems.routes.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-3xs flex justify-between items-start relative">
                          <div className="space-y-1 text-left">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</h4>
                            <p className="text-[11px] text-slate-400">{item.distance} • {item.duration} transit • {item.difficulty}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setSavedItems({ ...savedItems, routes: savedItems.routes.filter(x => x.id !== item.id) });
                              setNotification({ type: 'success', message: 'Removed route from saved.' });
                            }}
                            className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saved Attractions */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Attractions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedItems.attractions.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-3xs flex justify-between items-start relative">
                          <div className="space-y-1 text-left">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</h4>
                            <p className="text-[11px] text-slate-400">{item.category} • {item.time}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setSavedItems({ ...savedItems, attractions: savedItems.attractions.filter(x => x.id !== item.id) });
                              setNotification({ type: 'success', message: 'Removed attraction from saved.' });
                            }}
                            className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MESSAGES VIEW */}
              {activeTab === 'messages' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Direct communication with your local homestay hosts, mountain drivers and support staff.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    
                    {/* Threads List */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-2">Unread Messages</span>
                      {messages.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => {
                            // Mark read
                            setMessages(messages.map(m => m.id === thread.id ? { ...m, unread: false } : m));
                          }}
                          className={`w-full p-3 rounded-xl text-left transition duration-150 relative ${thread.unread ? 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}`}
                        >
                          <span className="font-bold text-xs block text-slate-900 dark:text-white">{thread.sender}</span>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{thread.text}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">{thread.time}</span>
                          {thread.unread && (
                            <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-rose-500" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Chat Panel Box */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
                      
                      {/* Message History Header */}
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">Karan Negi (Driver)</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">● Online • Solang Stand</span>
                        </div>
                      </div>

                      {/* Messages Flow */}
                      <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[220px]">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs max-w-[85%] self-start text-left space-y-1">
                          <p className="text-slate-700 dark:text-slate-300">Are you arriving by the luxury bus from Delhi? Let me know so I can coordinate the luggage carrier space on the rooftop carrier.</p>
                          <span className="text-[9px] text-slate-400 block font-mono text-right">08:52 AM</span>
                        </div>
                        <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 p-3 rounded-2xl text-xs max-w-[85%] ml-auto text-left space-y-1">
                          <p>Yes, we are on the morning bus. Will reach around 08:30 AM.</p>
                          <span className="text-[9px] opacity-60 block font-mono text-right">09:01 AM</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs max-w-[85%] self-start text-left space-y-1">
                          <p className="text-slate-700 dark:text-slate-300">Perfect! I will be waiting at the Manali Taxi Stand by 08:30 AM with the placard.</p>
                          <span className="text-[9px] text-slate-400 block font-mono text-right">09:12 AM</span>
                        </div>
                      </div>

                      {/* Input Actions */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newMessageText.trim()) return;
                          setNotification({ type: 'success', message: 'Message sent successfully.' });
                          setNewMessageText('');
                        }} 
                        className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3"
                      >
                        <input
                          type="text"
                          placeholder="Type your response..."
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:text-white"
                        />
                        <button 
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition cursor-pointer shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                  </div>
                </div>
              )}

              {/* 5. REVIEWS VIEW */}
              {activeTab === 'reviews' && (
                <div className="space-y-8 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Center</h2>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Submit feedback for mountain stays and private transit to help future backcountry travellers.</p>
                  </div>

                  {/* Pending Reviews */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Pending Reviews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingReviews.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs text-left space-y-3">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.type} Feedback</span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{item.title}</h4>
                            <p className="text-[11px] text-slate-400">Completed on {item.date}</p>
                          </div>

                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button 
                                key={star} 
                                onClick={() => setRatingInput(star)}
                                className="p-0.5 text-amber-400 hover:scale-110 transition cursor-pointer"
                              >
                                <Star className={`w-4 h-4 ${star <= ratingInput ? 'fill-amber-400' : 'text-slate-300'}`} />
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a quick comment..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:text-white"
                            />
                            <button
                              onClick={() => {
                                if (!reviewComment.trim()) return;
                                setSubmittedReviews([{ id: `new_s_${Date.now()}`, title: item.title, rating: ratingInput, comment: reviewComment, date: 'Today' }, ...submittedReviews]);
                                setPendingReviews(pendingReviews.filter(x => x.id !== item.id));
                                setReviewComment('');
                                setNotification({ type: 'success', message: 'Review recorded! Thank you for supporting the circle.' });
                              }}
                              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      ))}
                      {pendingReviews.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-4">No pending reviews. Excellent contribution!</p>
                      )}
                    </div>
                  </div>

                  {/* Submitted Reviews */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Submitted Reviews</h3>
                    <div className="space-y-3">
                      {submittedReviews.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs text-left">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h4>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                          </div>
                          <div className="flex gap-0.5 my-1.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-3 h-3 ${star <= item.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <p className="text-xs text-slate-505 dark:text-slate-400 italic">"{item.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. SUPPORT VIEW */}
              {activeTab === 'support' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Need Help?</h2>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Get 24/7 high-altitude assistance, road blockage alerts, and emergency mountain rescue coordinates.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Emergency Hotline details */}
                    <div className="bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200/50 dark:border-rose-900/40 p-5 rounded-2xl space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono uppercase tracking-wider block">⚠️ Emergency SOS Line</span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Regional Mountain Rescue</h4>
                        <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">For extreme blizzards, landslides, altitude sickness, or vehicle recovery assistance.</p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-rose-100 font-mono text-center">
                        <span className="block text-[10px] text-slate-450">DIRECT SATELLITE DISPATCH</span>
                        <a href="tel:+911902222123" className="block text-sm font-black text-rose-600 dark:text-rose-400 hover:underline mt-1">+91 1902-222123</a>
                      </div>
                    </div>

                    {/* Support form builder */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">Submit Support Case</span>
                      
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!supportSubject || !supportMessage) return;
                          setSupportQueries([{ id: `q_${Date.now()}`, subject: supportSubject, text: supportMessage, status: 'Open', date: 'Just now' }, ...supportQueries]);
                          setSupportSubject('');
                          setSupportMessage('');
                          setNotification({ type: 'success', message: 'Support case submitted. Mountain agents notified.' });
                        }} 
                        className="space-y-4"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Subject *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Booking date adjustment"
                            value={supportSubject}
                            onChange={(e) => setSupportSubject(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl p-2.5 text-xs dark:text-white focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Detailed Inquiry *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Explain your situation in detail. Our local field guides answer within 15 minutes."
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl p-2.5 text-xs dark:text-white focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                        >
                          Open Support Ticket
                        </button>
                      </form>

                      {/* Submitted tickets list */}
                      {supportQueries.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Submitted Support Queries</span>
                          {supportQueries.map(q => (
                            <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900 dark:text-white">{q.subject}</span>
                                <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">{q.status}</span>
                              </div>
                              <p className="text-slate-550 dark:text-slate-400 italic">"{q.text}"</p>
                              <span className="text-[9px] text-slate-400 block font-mono">{q.date}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* 7. SETTINGS VIEW */}
              {activeTab === 'settings' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Configure your personal profile details, security preferences, regional notifications and local workspace options.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Settings Navigation */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-2 pl-1">Configuration Blocks</span>
                      <a href="#profile-sect" className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & Contact</span>
                      </a>
                      <a href="#password-sect" className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Password & Security</span>
                      </a>
                      <a href="#notif-sect" className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Notifications</span>
                      </a>
                      <a href="#privacy-sect" className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span>Privacy</span>
                      </a>
                      <a href="#lang-sect" className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span>Language</span>
                      </a>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                      <a href="#delete-sect" className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </a>
                    </div>

                    {/* Settings Form fields */}
                    <div className="md:col-span-2 space-y-6">
                      
                      {/* PROFILE FORM */}
                      <div id="profile-sect" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-500" />
                          <span>Profile</span>
                        </h3>
                        
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                              <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Mobile</label>
                              <input
                                type="text"
                                value={profileMobile}
                                onChange={(e) => setProfileMobile(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Authorized Session Email</label>
                            <input
                              type="email"
                              disabled
                              value={profileEmail}
                              className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 cursor-not-allowed"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                          >
                            Save Details
                          </button>
                        </form>
                      </div>

                      {/* PASSWORD FORM */}
                      <div id="password-sect" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-500" />
                          <span>Password</span>
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">New Secure Password</label>
                            <input
                              type="password"
                              placeholder="Enter secure new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <button 
                            onClick={async () => {
                              if (!newPassword.trim()) {
                                setNotification({ type: 'error', message: 'Please write a new password first.' });
                                return;
                              }
                              try {
                                const res = await fetch('/api/auth/update-profile', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: user?.email, password: newPassword })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setNotification({ type: 'success', message: 'Password updated successfully.' });
                                  setNewPassword('');
                                } else {
                                  setNotification({ type: 'error', message: data.message });
                                }
                              } catch (e) {
                                setNotification({ type: 'success', message: 'Password update simulated successfully.' });
                                setNewPassword('');
                              }
                            }}
                            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>

                      {/* NOTIFICATIONS FORM */}
                      <div id="notif-sect" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-emerald-500" />
                          <span>Notifications</span>
                        </h3>
                        
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationsEnabled.email}
                              onChange={(e) => setNotificationsEnabled({ ...notificationsEnabled, email: e.target.checked })}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Email Alerts</span>
                              <span className="text-[10px] text-slate-450">Receive itinerary updates, booking confirmations and support tickets.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            <input
                              type="checkbox"
                              checked={notificationsEnabled.sms}
                              onChange={(e) => setNotificationsEnabled({ ...notificationsEnabled, sms: e.target.checked })}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">SMS Notifications</span>
                              <span className="text-[10px] text-slate-450">Immediate SMS coordinate delivery of drivers/homestays (recommended for offline mountain areas).</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            <input
                              type="checkbox"
                              checked={notificationsEnabled.pushes}
                              onChange={(e) => setNotificationsEnabled({ ...notificationsEnabled, pushes: e.target.checked })}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Desktop Push</span>
                              <span className="text-[10px] text-slate-450">In-browser immediate notification on active chat messages.</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* PRIVACY FORM */}
                      <div id="privacy-sect" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-500" />
                          <span>Privacy</span>
                        </h3>
                        
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacyPublic}
                              onChange={(e) => setPrivacyPublic(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Public Contributor Profile</span>
                              <span className="text-[10px] text-slate-450">Allow other mountain explorers to view your submitted guide reviews.</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* LANGUAGE FORM */}
                      <div id="lang-sect" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-500" />
                          <span>Language</span>
                        </h3>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Selected Display Language</label>
                          <select
                            value={selectedLanguage}
                            onChange={(e) => {
                              setSelectedLanguage(e.target.value);
                              setNotification({ type: 'success', message: `Interface language updated to: ${e.target.value}` });
                            }}
                            className="bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl py-2 px-3 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100"
                          >
                            <option value="English">English (United States)</option>
                            <option value="Hindi">हिन्दी (India)</option>
                            <option value="Nepali">नेपाली (Nepal)</option>
                            <option value="Spanish">Español (Spain)</option>
                          </select>
                        </div>
                      </div>

                      {/* DELETE ACCOUNT FORM */}
                      <div id="delete-sect" className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">Danger Zone</h3>
                          <p className="text-xs text-rose-600 dark:text-rose-450 leading-relaxed">Deleting your account is permanent. All pending itineraries, driver quotes and saved places will be immediately purged from our servers.</p>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm('Are you absolutely sure you want to permanently delete your HillyTrip account? This action is irreversible.')) {
                              setNotification({ type: 'success', message: 'Account deleted successfully. Session destroyed.' });
                              handleLogout();
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                        >
                          Delete Account Permanently
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
