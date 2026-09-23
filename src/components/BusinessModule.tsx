import React, { useState } from 'react';
import { 
  Building, Car, Map, ShieldCheck, ArrowRight, Compass, Calendar, 
  Users, TrendingUp, MessageSquare, Plus, Check, Star, Settings, Info, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BusinessOS from './BusinessOS';

interface BusinessModuleProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
  dbHomestays: any[];
  reloadDb?: () => Promise<void> | void;
  currentPath: string;
}

export default function BusinessModule({
  user,
  onUpdateUser,
  navigate,
  setNotification,
  dbHomestays,
  reloadDb,
  currentPath
}: BusinessModuleProps) {
  // If user has any approved business, let them select which dashboard they want to view
  const [selectedDashboard, setSelectedDashboard] = useState<'homestay' | 'taxi' | 'tour' | null>(() => {
    if (!user) return null;
    if (user.currentBusinessType) {
      if (user.currentBusinessType === 'homestay') return 'homestay';
      if (user.currentBusinessType === 'taxi_operator') return 'taxi';
      if (user.currentBusinessType === 'tour_operator') return 'tour';
    }
    if (user.role === 'partner' || user.partnerStatus === 'approved' || user.businessType === 'homestay') {
      return 'homestay';
    }
    if (user.roles?.includes('driver') || user.businessType === 'cab') {
      return 'taxi';
    }
    if (user.businessType === 'tour' || user.role === 'tour_operator') {
      return 'tour';
    }
    return null;
  });

  const isHomestayOwner = user?.role === 'partner' || user?.partnerStatus === 'approved' || user?.businessType === 'homestay';
  const isTaxiOperator = user?.roles?.includes('driver') || user?.businessType === 'cab';
  const isTourOperator = user?.businessType === 'tour' || user?.role === 'tour_operator' || user?.contributorStatus === 'approved';

  const hasAnyBusiness = isHomestayOwner || isTaxiOperator || isTourOperator;

  // Render direct Universal Business OS Dashboard if chosen
  if (selectedDashboard && hasAnyBusiness) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <button 
            onClick={() => setSelectedDashboard(null)}
            className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
          >
            ← Back to Business Hub
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Enterprise Mode:</span>
            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Universal Business OS
            </span>
          </div>
        </div>
        
        <BusinessOS 
          user={user}
          onUpdateUser={onUpdateUser}
          navigate={navigate}
          setNotification={setNotification}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 selection:bg-emerald-500/10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-teal-900 to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 animate-pulse" /> HillyTrip Business Hub
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Empowering Himalayan Local Businesses
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Verify your properties, cabs or tours to begin serving thousands of enthusiastic travelers. 
            Manage reservations, receive direct payments and scale your mountain tourism business effortlessly.
          </p>
        </div>
      </div>

      {/* MY BUSINESSES SECTION */}
      {hasAnyBusiness && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">My Active Businesses</h2>
            <p className="text-xs text-slate-500">Select any of your approved services below to launch its management console.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isHomestayOwner && (
              <button 
                onClick={() => {
                  onUpdateUser({ ...user, currentBusinessType: 'homestay' });
                  setSelectedDashboard('homestay');
                }}
                className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 hover:border-emerald-500/50 p-6 rounded-2xl text-left cursor-pointer transition duration-200 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Building className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">Homestay Management</h3>
                <p className="text-xs text-slate-500 mt-2">Manage claims, update rates, and view upcoming traveler reservations.</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-4">
                  <span>Open Console</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}

            {isTaxiOperator && (
              <button 
                onClick={() => {
                  onUpdateUser({ ...user, currentBusinessType: 'taxi_operator' });
                  setSelectedDashboard('taxi');
                }}
                className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 hover:border-amber-500/50 p-6 rounded-2xl text-left cursor-pointer transition duration-200 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Car className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">Taxi Operations</h3>
                <p className="text-xs text-slate-500 mt-2">Update vehicles, select service routes, and send instant quote estimates.</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-4">
                  <span>Open Console</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}

            {isTourOperator && (
              <button 
                onClick={() => {
                  onUpdateUser({ ...user, currentBusinessType: 'tour_operator' });
                  setSelectedDashboard('tour');
                }}
                className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 hover:border-sky-500/50 p-6 rounded-2xl text-left cursor-pointer transition duration-200 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Map className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">Tour Operator Console</h3>
                <p className="text-xs text-slate-500 mt-2">Create custom itineraries, manage tour groups, and view activity reports.</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider mt-4">
                  <span>Open Console</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* REGISTRATION CARDS */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Expand Your Portfolio</h2>
          <p className="text-xs text-slate-500">Interested in launching other services? Register with HillyTrip as a certified driver or property owner.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Homestay Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">List Your Homestay</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Have an empty room or cozy wooden lodge in Lahaul, Solang, or Sissu? List it on HillyTrip and earn passive seasonal income.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('#/register/homestay')}
              className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-slate-100 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Register Homestay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Taxi Operator Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Become Taxi Operator</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Drive a 4x4 or commercial SUV and know the high mountain passes like the back of your hand? Serve travelers safely.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('#/become-taxi-operator')}
              className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-800 dark:bg-slate-800 dark:hover:bg-amber-500 dark:text-slate-100 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Register Vehicle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tour Operator Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Become Tour Operator</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Love leading treks, backpacking trips, or cultural excursions? Create bespoke Himalayan packages and host global explorers.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('#/register/driver')}
              className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-800 dark:bg-slate-800 dark:hover:bg-sky-500 dark:text-slate-100 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Register Operator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PREMIUM MOCK TOUR OPERATOR DASHBOARD
function TourOperatorDashboard({ user, onBack }: { user: any; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'itineraries' | 'bookings'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [itineraries, setItineraries] = useState([
    { id: 'it_1', title: 'Hampta Pass Scenic Snow Trek', duration: '4 Days / 3 Nights', price: '₹7,500/person', difficulty: 'Moderate', status: 'Published' },
    { id: 'it_2', title: 'Spiti Valley Backcountry Camper Route', duration: '8 Days / 7 Nights', price: '₹18,200/person', difficulty: 'Hard', status: 'Published' },
    { id: 'it_3', title: 'Chandra Taal Lakeside Astrophotography Trip', duration: '3 Days / 2 Nights', price: '₹6,400/person', difficulty: 'Easy', status: 'Draft' }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('Moderate');

  const handleAddItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item = {
      id: `it_${Date.now()}`,
      title: newTitle,
      duration: newDuration || '3 Days / 2 Nights',
      price: `₹${newPrice || '5,000'}/person`,
      difficulty: newDifficulty,
      status: 'Published'
    };
    setItineraries([item, ...itineraries]);
    setNewTitle('');
    setNewDuration('');
    setNewPrice('');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
          >
            ← Back to Business Hub
          </button>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Tour Operator Dashboard</h1>
        </div>
        <span className="bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-200">
          Certified Host
        </span>
      </div>

      {/* DASHBOARD TABS */}
      <div className="flex gap-2 border-b border-slate-150 dark:border-slate-800 pb-px">
        {(['overview', 'itineraries', 'bookings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === tab 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-3xs space-y-1">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider font-mono">Active Group Bookings</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">12</h3>
              <span className="text-[10px] text-emerald-500 font-bold font-mono">▲ 15% vs Last Month</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-3xs space-y-1">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider font-mono">Published Tours</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{itineraries.filter(i=>i.status==='Published').length}</h3>
              <span className="text-[10px] text-slate-400 font-mono">Updated today</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-3xs space-y-1">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider font-mono">Gross Estimates</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">₹46,800</h3>
              <span className="text-[10px] text-emerald-500 font-bold font-mono">▲ 8% seasonal lift</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-3xs space-y-1">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider font-mono">Average Host Rating</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1">
                <span>4.9</span>
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0" />
              </h3>
              <span className="text-[10px] text-sky-500 font-mono">Based on 14 reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Traveler Inquiries</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ananya Sen (Delhi)</h4>
                    <p className="text-[10px] text-slate-400">Inquired about Hampta Pass Trek for a group of 4</p>
                  </div>
                  <button className="text-[10px] font-black bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400 px-3 py-1.5 rounded-lg transition cursor-pointer">
                    Reply In Inbox
                  </button>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Vikram Rathore (Chandigarh)</h4>
                    <p className="text-[10px] text-slate-400">Requested customize itinerary for Spiti overlander camper</p>
                  </div>
                  <button className="text-[10px] font-black bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400 px-3 py-1.5 rounded-lg transition cursor-pointer">
                    Reply In Inbox
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Active Alerts</h3>
              <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/30 flex gap-3 text-xs text-sky-800 dark:text-sky-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Ensure medical certificates are uploaded by travelers participating in Hard Difficulty treks.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'itineraries' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Manage Itineraries</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Tour Package</span>
            </button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleAddItinerary}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Package Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chandra Taal Serene Sunset Retreat"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Days / 4 Nights"
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Estimated Price per Traveler *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8,500"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Difficulty Grade</label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
                <div className="flex items-end md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    Publish Itinerary
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {itineraries.map(it => (
              <div key={it.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono tracking-wider ${
                    it.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600' :
                    it.difficulty === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {it.difficulty}
                  </span>
                  <span className={`text-[9px] font-bold ${it.status === 'Published' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    ● {it.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{it.title}</h4>
                  <p className="text-[10px] text-slate-400">{it.duration}</p>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">{it.price}</span>
                  <button className="text-[10px] font-bold text-sky-500 hover:text-sky-400 transition cursor-pointer">
                    Edit Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Traveler Bookings Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Traveler</th>
                  <th className="pb-3">Tour Package</th>
                  <th className="pb-3">Slots</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Receipt</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                <tr>
                  <td className="py-3">Ananya Sen</td>
                  <td className="py-3 text-sky-500">Hampta Pass Scenic Snow Trek</td>
                  <td className="py-3">4 Slots</td>
                  <td className="py-3">Jul 20 - Jul 24, 2026</td>
                  <td className="py-3 font-mono">₹30,000</td>
                  <td className="py-3 text-emerald-500">Confirmed</td>
                </tr>
                <tr>
                  <td className="py-3">Rahul Deshmukh</td>
                  <td className="py-3 text-sky-500">Spiti Valley Camper Route</td>
                  <td className="py-3">2 Slots</td>
                  <td className="py-3">Aug 02 - Aug 10, 2026</td>
                  <td className="py-3 font-mono">₹36,400</td>
                  <td className="py-3 text-emerald-500">Confirmed</td>
                </tr>
                <tr>
                  <td className="py-3">Evelyn Miller</td>
                  <td className="py-3 text-sky-500">Hampta Pass Scenic Snow Trek</td>
                  <td className="py-3">1 Slot</td>
                  <td className="py-3">Jul 20 - Jul 24, 2026</td>
                  <td className="py-3 font-mono">₹7,500</td>
                  <td className="py-3 text-amber-500">Pending Docs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
