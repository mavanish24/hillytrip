import React, { useState } from 'react';
import { 
  Signal, ShieldAlert, HeartPulse, Search, Fuel, CreditCard,
  PhoneCall, Zap, Compass, CheckCircle2, ChevronRight, Activity, HardDrive
} from 'lucide-react';
import { Destination } from '../types';

interface ConnectivityRecord {
  villageId: string;
  name: string;
  jio: 'Excellent' | 'Moderate' | 'Weak' | 'None';
  airtel: 'Excellent' | 'Moderate' | 'Weak' | 'None';
  bsnl: 'Excellent' | 'Moderate' | 'Weak' | 'None';
  features: {
    atm: string;      // ATM status / distance
    medical: string;  // Clinic / First aid info
    fuel: string;     // Fuel station distance
    electricity: string; // Power reliability
  };
  customNotes: string;
}

interface SurvivalIndexProps {
  destinations: Destination[];
}

export default function SurvivalIndex({ destinations }: SurvivalIndexProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom connectivity signal ratings and proximity data compiled for Darjeeling / North Bengal villages
  const connectivityDatabase: ConnectivityRecord[] = [
    {
      villageId: 'sittong',
      name: 'Sittong Village (I, II, III)',
      jio: 'Moderate',
      airtel: 'Excellent',
      bsnl: 'Weak',
      features: {
        atm: 'No ATM. Closest ATM is at Mongpu or Kurseong (~16km). Carry physical cash.',
        medical: 'Rural sub-health clinic in Sittong I. Local pharmacy in Sittong II.',
        fuel: 'No fuel pumps. Closest refueling is at Kalijhora (~12km) or Kurseong.',
        electricity: 'Fair. Frequent power shuts after heavy monsoon rainfall grids.'
      },
      customNotes: 'Airtel has the strongest 4G carriage here. Jio drops entirely inside lower valley homestays.'
    },
    {
      villageId: 'lava',
      name: 'Lava Village Forest Ridge',
      jio: 'Excellent',
      airtel: 'Excellent',
      bsnl: 'Moderate',
      features: {
        atm: 'SBI ATM present in Lava bazaar (reliable). Private ATMs nearby.',
        medical: 'Lava Block Primary Health Center (PHC) with 24/7 emergency response.',
        fuel: 'Closest petrol pump is at Algara (~14km) or Gorubathan.',
        electricity: 'Very reliable. Power cuts cleared quickly due to tourism center.'
      },
      customNotes: 'Strong cellular grids from both major providers. 4G data speeds are reliable.'
    },
    {
      villageId: 'rishop',
      name: 'Rishop High Peak',
      jio: 'Moderate',
      airtel: 'Weak',
      bsnl: 'Excellent',
      features: {
        atm: 'No ATMs. Entirely dependent on Lava Bazaar (~4km steep hike or 9km drive).',
        medical: 'First aid kit available in hotels. Nearest clinic/doctors in Lava.',
        fuel: 'No fuel. Petrol must be secured down in Algara.',
        electricity: 'Poor. Backup generators or solar arrays are common in homestays.'
      },
      customNotes: 'BSNL offers highly reliable old-school GSM calls on high ridges. Data speeds are weak.'
    },
    {
      villageId: 'mirik',
      name: 'Mirik Lake Valley',
      jio: 'Excellent',
      airtel: 'Excellent',
      bsnl: 'Excellent',
      features: {
        atm: 'Multiple nationalized ATMs in Mirik Town (Axis, SBI, HDFC). UPI works everywhere.',
        medical: 'Mirik Sub-divisional Hospital with fully equipped trauma care unit.',
        fuel: 'Indian Oil petrol pump directly inside Mirik Bazaar sector.',
        electricity: 'Excellent. Stable grid connections throughout the year.'
      },
      customNotes: 'Full high-altitude town. No signal drops. Excellent remote work speeds.'
    },
    {
      villageId: 'loleygaon',
      name: 'Loleygaon Canopy Valley',
      jio: 'Weak',
      airtel: 'Moderate',
      bsnl: 'Moderate',
      features: {
        atm: 'No functioning ATM. Closest is at Lava (~22km) or Kalimpong.',
        medical: 'Small primary emergency center. Major treatments require Kalimpong Hospital.',
        fuel: 'Fuel can only be filled in Kalimpong.',
        electricity: 'Moderate. Heavy woodland storms easily drop overhead electric feeds.'
      },
      customNotes: 'Airtel is relatively serviceable around the canopy walkway tree segment.'
    },
    {
      villageId: 'pedong',
      name: 'Pedong Historic Town',
      jio: 'Excellent',
      airtel: 'Excellent',
      bsnl: 'Moderate',
      features: {
        atm: 'Central Bank of India ATM and SBI ATM in Pedong main road bypass.',
        medical: 'Pedong Government Hospital with resident physician officers.',
        fuel: 'Closest Petrol Pump is at Kalimpong (~21km) or Rangpo.',
        electricity: 'Reliable town power routing with minor daily load-shed segments.'
      },
      customNotes: 'Excellent 4G and 5G density near the historic Bhutan-Tibet trade route segment.'
    },
    {
      villageId: 'rimbik',
      name: 'Rimbik (Singalila base)',
      jio: 'Weak',
      airtel: 'Weak',
      bsnl: 'Moderate',
      features: {
        atm: 'No active cash dispensers. Cash must be loaded in Darjeeling or Sukhia.',
        medical: 'Primary health hub, basic sutures. Serious symptoms routed to Darjeeling.',
        fuel: 'Closest fuel filling is located at Sukhiapokhri (~38km).',
        electricity: 'Fair. Local mini-hydro power setups complement the central grid.'
      },
      customNotes: 'Extremely remote base camp. Satellite phones or old-school BSNL SIMs recommended.'
    }
  ];

  const getSignalStrengthColor = (lvl: string) => {
    switch (lvl) {
      case 'Excellent': return 'text-emerald-500 font-extrabold';
      case 'Moderate': return 'text-sky-500 font-extrabold';
      case 'Weak': return 'text-amber-500 font-bold';
      case 'None': return 'text-rose-500 font-bold';
      default: return 'text-slate-400';
    }
  };

  const getSignalStrengthBadge = (name: string, lvl: string) => {
    let color = '';
    if (lvl === 'Excellent') color = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    else if (lvl === 'Moderate') color = 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
    else if (lvl === 'Weak') color = 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse';
    else color = 'bg-rose-500/10 text-rose-500 border border-rose-500/20';

    return (
      <div className={`p-2 rounded-xl text-center flex flex-col justify-center items-center ${color}`}>
        <span className="text-[9px] uppercase font-mono font-black text-slate-400">{name}</span>
        <span className="text-xs font-black mt-0.5">{lvl}</span>
      </div>
    );
  };

  const filteredConnectivity = connectivityDatabase.filter(r => {
    return r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.customNotes.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div id="survival-matrix-root" className="max-w-4xl mx-auto px-4 py-8 text-slate-800 dark:text-slate-100">
      
      {/* Informative Header card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm text-left">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 dark:text-sky-400 rounded-2xl flex items-center justify-center shrink-0 border border-sky-500/20 animate-pulse">
            <Signal className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 mb-2 uppercase tracking-wider font-mono">
              Signal & Safety Dossier
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Village Signal & Offbeat survival Matrix
            </h2>
            <p className="text-xs text-slate-550 mt-1 max-w-xl leading-relaxed">
              Before traveling into offbeat Himalayan forest locations, map your connectivity. Check which networks have high data speed, check coordinates for nearest petrol, cash dispensers, and clinics in real metrics.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Search & Results list directory */}
        <div className="lg:col-span-2 space-y-5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offbeat villages (e.g. Sittong, Lava)..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 pl-10 rounded-xl text-xs text-slate-800 dark:text-white font-medium focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="space-y-4">
            {filteredConnectivity.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-850">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-extrabold text-slate-700 dark:text-slate-350">Village Coordinates Not in Database</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto">
                  To keep maps fast and responsive, offbeat locations are indexed step-by-step. Let's enter a different village search.
                </p>
              </div>
            ) : (
              filteredConnectivity.map(record => (
                <div 
                  key={record.villageId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-2xl p-5 shadow-sm text-left transition-all duration-150 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {record.name}
                      </h3>
                      <p className="text-[11px] text-slate-450 mt-1">
                        Carrier reports: <strong className="text-slate-550 dark:text-slate-350 font-sans">{record.customNotes}</strong>
                      </p>
                    </div>

                    {/* Circular Signal Grid displays */}
                    <div className="grid grid-cols-3 gap-2 shrink-0 w-full sm:w-auto">
                      {getSignalStrengthBadge('jio 4g', record.jio)}
                      {getSignalStrengthBadge('airtel', record.airtel)}
                      {getSignalStrengthBadge('bsnl gsm', record.bsnl)}
                    </div>
                  </div>

                  {/* Proximity Features grid list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-855">
                      <CreditCard className="w-4.5 h-4.5 text-sky-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-black text-[10px] uppercase text-slate-405 tracking-wider font-mono">Cash Dispenser ATM</strong>
                        <span className="text-slate-600 dark:text-slate-300 block mt-1 leading-normal font-medium">{record.features.atm}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-955/40 rounded-xl border border-slate-100 dark:border-slate-855">
                      <HeartPulse className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-black text-[10px] uppercase text-slate-405 tracking-wider font-mono">Medical Clinic</strong>
                        <span className="text-slate-600 dark:text-slate-300 block mt-1 leading-normal font-medium">{record.features.medical}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-955/40 rounded-xl border border-slate-100 dark:border-slate-855">
                      <Fuel className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-black text-[10px] uppercase text-slate-405 tracking-wider font-mono">Refueling Petrol pump</strong>
                        <span className="text-slate-600 dark:text-slate-300 block mt-1 leading-normal font-medium">{record.features.fuel}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-955/40 rounded-xl border border-slate-100 dark:border-slate-855">
                      <Zap className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-black text-[10px] uppercase text-slate-405 tracking-wider font-mono">Electricity Grid Grid</strong>
                        <span className="text-slate-600 dark:text-slate-300 block mt-1 leading-normal font-medium">{record.features.electricity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )))
            }
          </div>
        </div>

        {/* Sidebar: Offline Survival Protocol Guides */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-5 text-left">
            <h3 className="text-xs font-black uppercase text-sky-500 tracking-wider font-mono mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-500" /> Survival Protocols
            </h3>
            
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block mb-1">Mountain Cold-Pack Advice</span>
            <p className="text-[11px] text-slate-500 leading-normal mb-4">
              Cold damp slopes sap phone battery voltages. Put backup mobile cells inside inner insulating jacket segments near core body heat.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">Verify homestay coordinates inside HillyTrip **Offline Center** while signals are dry.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">Bring a hard-copy photocopied layout trail sheet (Print from DIY Trip Itineraries).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">Pack a charged 20000mAh durable powerbank for sub-zero emergency safety support.</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-slate-900 to-sky-950 border border-slate-800 text-white rounded-3xl p-5 text-left shadow-lg">
            <h3 className="text-xs font-black uppercase text-sky-400 tracking-wider font-mono mb-3 flex items-center gap-1.5">
              <HardDrive className="w-4.5 h-4.5 text-emerald-400 animate-pulse" /> PWA Caching Help
            </h3>
            <span className="text-xs font-bold text-slate-100 block mb-1">Offline Capability instructions</span>
            <p className="text-[11px] text-slate-350 leading-relaxed">
              This site supports Progressive Web App (PWA) protocols. If you click **Download Offline Travel Bundle** in the **Offline Center** panel, all maps, signals indices, routes coordinates are replicated inside device IndexDB caches. You can inspect them even while completely stranded offline!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
