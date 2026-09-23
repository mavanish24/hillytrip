import React, { useState } from 'react';
import { X, Database, Layers, GitCommit, ArrowRight, ShieldCheck, CheckCircle2, Car, Users, Phone, Zap, ChevronRight, HardDrive, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaxiArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaxiArchitectureModal: React.FC<TaxiArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'erd' | 'hierarchy' | 'user_flow' | 'operator_flow' | 'scalability'>('erd');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-50 tracking-tight flex items-center gap-2">
                HillyTrip Taxi Module Architecture
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Phase 1 Specs
                </span>
              </h2>
              <p className="text-xs text-slate-400">Route-First Transport Discovery & Lead Generation System</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
          {[
            { id: 'erd', label: '1. Database ERD & Schema', icon: Database },
            { id: 'hierarchy', label: '2. Component Hierarchy', icon: Layers },
            { id: 'user_flow', label: '3. User Flow', icon: Smartphone },
            { id: 'operator_flow', label: '4. Unified Operator Flow', icon: Users },
            { id: 'scalability', label: '5. Phase 1 vs Phase 2', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-300">
          {activeTab === 'erd' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-200 text-xs">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-bold block mb-1">Unified Multi-Provider Architecture (`owner_type`)</strong>
                  Vehicles are NOT duplicated for Homestays or Travel Agencies. An entity can belong to a <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">taxi_operator</code>, <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">homestay_owner</code>, or <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">travel_agency</code> using the polymorphic <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">owner_type</code> and <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">owner_id</code> relationship.
                </div>
              </div>

              {/* ERD Table Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Operators Table */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-black text-amber-400 text-xs flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" /> operators
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Core Entity</span>
                  </div>
                  <ul className="font-mono text-[11px] space-y-1 text-slate-400">
                    <li className="text-slate-200">id <span className="text-slate-500">(PK)</span></li>
                    <li className="text-amber-300 font-bold">owner_type <span className="text-amber-500/80">(enum: taxi_op | homestay | agency)</span></li>
                    <li>owner_id <span className="text-slate-500">(FK)</span></li>
                    <li>business_name <span className="text-slate-500">(string)</span></li>
                    <li>pickup_areas <span className="text-slate-500">(string[])</span></li>
                    <li>drop_areas <span className="text-slate-500">(string[])</span></li>
                    <li>base_taxi_stand <span className="text-slate-500">(string)</span></li>
                    <li>rating <span className="text-slate-500">(float)</span></li>
                    <li>is_verified <span className="text-slate-500">(boolean)</span></li>
                  </ul>
                </div>

                {/* Vehicles Table */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-black text-emerald-400 text-xs flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" /> vehicles
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Unified Fleet</span>
                  </div>
                  <ul className="font-mono text-[11px] space-y-1 text-slate-400">
                    <li className="text-slate-200">id <span className="text-slate-500">(PK)</span></li>
                    <li className="text-emerald-300 font-bold">owner_type <span className="text-emerald-500/80">(Polymorphic FK)</span></li>
                    <li className="text-emerald-300 font-bold">owner_id <span className="text-emerald-500/80">(Polymorphic FK)</span></li>
                    <li>model_name <span className="text-slate-500">(Bolero | Ertiga | Innova...)</span></li>
                    <li>seats <span className="text-slate-500">(number)</span></li>
                    <li>luggage_bags <span className="text-slate-500">(number)</span></li>
                    <li>is_ac <span className="text-slate-500">(boolean)</span></li>
                    <li>route_starting_price <span className="text-slate-500">(number)</span></li>
                  </ul>
                </div>

                {/* Operator Service Areas */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-black text-sky-400 text-xs flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> operator_service_areas
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Route Logic</span>
                  </div>
                  <ul className="font-mono text-[11px] space-y-1 text-slate-400">
                    <li className="text-slate-200">id <span className="text-slate-500">(PK)</span></li>
                    <li>operator_id <span className="text-slate-500">(FK -&gt; operators.id)</span></li>
                    <li className="text-sky-300 font-bold">pickup_areas <span className="text-slate-500">(text[])</span></li>
                    <li className="text-sky-300 font-bold">drop_areas <span className="text-slate-500">(text[])</span></li>
                    <li>working_districts <span className="text-slate-500">(text[])</span></li>
                  </ul>
                </div>

                {/* Vehicle Images */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-black text-purple-400 text-xs">vehicle_images</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Media</span>
                  </div>
                  <ul className="font-mono text-[11px] space-y-1 text-slate-400">
                    <li className="text-slate-200">id <span className="text-slate-500">(PK)</span></li>
                    <li>vehicle_id <span className="text-slate-500">(FK -&gt; vehicles.id)</span></li>
                    <li>image_url <span className="text-slate-500">(string)</span></li>
                    <li>caption <span className="text-slate-500">(string)</span></li>
                  </ul>
                </div>

                {/* Reviews */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-black text-amber-400 text-xs">reviews</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Social Proof</span>
                  </div>
                  <ul className="font-mono text-[11px] space-y-1 text-slate-400">
                    <li className="text-slate-200">id <span className="text-slate-500">(PK)</span></li>
                    <li>operator_id <span className="text-slate-500">(FK -&gt; operators.id)</span></li>
                    <li>rating <span className="text-slate-500">(1 to 5)</span></li>
                    <li>comment <span className="text-slate-500">(text)</span></li>
                    <li>date <span className="text-slate-500">(timestamp)</span></li>
                  </ul>
                </div>

                {/* Future Bookings & Leads */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-black text-rose-400 text-xs">lead_booking_requests</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">Phase 1 Lead</span>
                  </div>
                  <ul className="font-mono text-[11px] space-y-1 text-slate-400">
                    <li className="text-slate-200">id <span className="text-slate-500">(PK)</span></li>
                    <li>operator_id <span className="text-slate-500">(FK -&gt; operators.id)</span></li>
                    <li>traveller_name <span className="text-slate-500">(string)</span></li>
                    <li>traveller_phone <span className="text-slate-500">(string)</span></li>
                    <li>route_from / route_to <span className="text-slate-500">(string)</span></li>
                    <li>status <span className="text-slate-500">(pending | contacted | completed)</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hierarchy' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-amber-400 font-bold text-sm">Taxi Module Component Hierarchy</div>
                <div className="pl-4 border-l-2 border-amber-500/30 space-y-2 text-slate-300">
                  <div>📁 TaxiView.tsx <span className="text-slate-500 text-[10px]">(Main Entrypoint)</span></div>
                  <div className="pl-4 border-l-2 border-slate-700 space-y-2">
                    <div>├── 🔍 TaxiHeroSearch.tsx <span className="text-slate-500 text-[10px]">(From, To, Date, Passengers, TripType)</span></div>
                    <div>├── 📊 TripCompactSummary.tsx <span className="text-slate-500 text-[10px]">(Route Distance, Time, Shared & Reserved Availability)</span></div>
                    <div>├── 🚕 TravelOptionsSection.tsx <span className="text-slate-500 text-[10px]">(Shared Taxi Card & Reserved Taxi Card)</span></div>
                    <div>│ &nbsp; ├── 📍 PickupLocationModal.tsx <span className="text-slate-500 text-[10px]">(Shared Motor Stand Guidelines & Map)</span></div>
                    <div>├── 👥 OperatorList.tsx <span className="text-slate-500 text-[10px]">(Strict Service Area Matching & Lead Actions)</span></div>
                    <div>│ &nbsp; ├── 🚙 OperatorFleetDrawer.tsx <span className="text-slate-500 text-[10px]">(Bolero, Ertiga, Innova, Traveller Cards)</span></div>
                    <div>│ &nbsp; └── 📝 BookingLeadModal.tsx <span className="text-slate-500 text-[10px]">(Lead Dispatcher Form)</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'user_flow' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-100 text-base">User Journey Flow (Route First)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { step: '1. Search Route', desc: 'User inputs From (e.g. NJP) → To (e.g. Kalimpong) & selects Shared / Reserved.' },
                  { step: '2. Compact Summary', desc: 'Displays exact distance (67 km), duration (~2.5 hrs), and available options.' },
                  { step: '3. Transport Option', desc: 'User chooses Shared Taxi (₹350/seat) or Reserved Taxi starting prices.' },
                  { step: '4. Operator & Fleet', desc: 'User filters verified operators, selects vehicle, completes Booking Review Sheet, and connects via HillyTrip In-App Chat.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{item.step}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'operator_flow' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-100 text-base">Unified Operator Registration & Service Area Matching</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <p className="text-xs text-slate-300">
                  Whether the provider is a traditional <strong>Taxi Operator</strong>, a <strong>Homestay Owner</strong> providing guest pickups, or a <strong>Travel Agency</strong> running tourist coaches, they register via a single unified dashboard:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-400 block">1. Service Areas</span>
                    <p className="text-slate-400">Specify exact pickup hubs (e.g., NJP, Bagdogra) and drop destinations (e.g., Kalimpong, Lava).</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-400 block">2. Fleet Registration</span>
                    <p className="text-slate-400">Add vehicles with model name, seating capacity, luggage limits, and AC status.</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-sky-400 block">3. In-App Requests</span>
                    <p className="text-slate-400">Receive booking requests directly in HillyTrip chat thread with real-time status updates.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scalability' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-extrabold text-emerald-400 text-sm">Phase 1: Active Focus</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li>✔ Route-First Search Engine (From → To)</li>
                    <li>✔ Shared & Reserved Transport Options</li>
                    <li>✔ Strict Service Area Operator Matching</li>
                    <li>✔ Verified Operator Profiles & Ratings</li>
                    <li>✔ Vehicle Fleet Display (Seats, Bags, AC)</li>
                    <li>✔ HillyTrip Ecosystem In-App Messaging & Booking Sheet</li>
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h4 className="font-extrabold text-amber-400 text-sm">Phase 2: Roadmap Expansion</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-400">
                    <li>⚡ Real-time Online Seat Booking & Payment Gateway</li>
                    <li>⚡ Driver Live GPS Location Tracking & ETA</li>
                    <li>⚡ Automated Driver & Vehicle Assignment</li>
                    <li>⚡ Dynamic Surge & Peak-Season Pricing Engine</li>
                    <li>⚡ Automated Permit Documentation Dispatch</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">HillyTrip Transport Architecture Standard</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
          >
            Close Specification Viewer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
