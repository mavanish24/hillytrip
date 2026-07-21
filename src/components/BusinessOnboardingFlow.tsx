import React, { useState } from 'react';
import { 
  Home, 
  Building, 
  Tent, 
  Car, 
  Key, 
  Bike, 
  Globe, 
  Briefcase, 
  Compass, 
  Utensils, 
  Coffee, 
  Mountain, 
  Flame, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Building2,
  CheckCircle,
  Award,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaxiOperatorOnboarding from './TaxiOperatorOnboarding';
import UniversalOnboardingEngine from './UniversalOnboardingEngine';
import { businessConfigurations } from './businessConfigurations';

interface BusinessOnboardingFlowProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  onOpenLoginModal: () => void;
}

interface BusinessTypeItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  colorClass: string;
  bgColorClass: string;
}

interface BusinessCategory {
  categoryName: string;
  items: BusinessTypeItem[];
}

export default function BusinessOnboardingFlow({
  user,
  onUpdateUser,
  navigate,
  onOpenLoginModal
}: BusinessOnboardingFlowProps) {
  // Global selectedBusinessType store (reads/writes to localStorage as well for persistence)
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(() => {
    return localStorage.getItem('hillytrip_selected_business_type') || null;
  });

  // Flow state: 'selection' or 'onboarding'
  const [flowState, setFlowState] = useState<'selection' | 'onboarding'>(() => {
    const hasSelection = localStorage.getItem('hillytrip_selected_business_type');
    return hasSelection ? 'onboarding' : 'selection';
  });

  // List of all business categories and their specific types as requested
  const businessCategories: BusinessCategory[] = [
    {
      categoryName: 'Accommodation',
      items: [
        {
          id: 'homestay',
          name: 'Homestay',
          description: 'Offer travelers a warm Himalayan home with local stories and organic meals.',
          icon: Home,
          colorClass: 'text-emerald-600 dark:text-emerald-400',
          bgColorClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50'
        },
        {
          id: 'hotel',
          name: 'Hotel',
          description: 'Provide professional rooms, amenities, and hospitality in key hill destinations.',
          icon: Building,
          colorClass: 'text-blue-600 dark:text-blue-400',
          bgColorClass: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50'
        },
        {
          id: 'resort',
          name: 'Resort',
          description: 'Offer premium luxury cottages, stunning views, and full recreational services.',
          icon: Building2,
          colorClass: 'text-indigo-600 dark:text-indigo-400',
          bgColorClass: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50'
        },
        {
          id: 'camping',
          name: 'Camping',
          description: 'Host outdoor adventure tents, stargazing glamping, and riverside base camps.',
          icon: Tent,
          colorClass: 'text-teal-600 dark:text-teal-400',
          bgColorClass: 'bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/50'
        }
      ]
    },
    {
      categoryName: 'Transport',
      items: [
        {
          id: 'taxi_operator',
          name: 'Taxi Operator',
          description: 'Manage fleets of mountain-certified cabs for local sightseeing, transfers and tours.',
          icon: Car,
          colorClass: 'text-amber-600 dark:text-amber-400',
          bgColorClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50'
        },
        {
          id: 'car_rental',
          name: 'Car Rental',
          description: 'Provide self-drive or chauffeur-driven vehicles for exploring at the traveler’s own pace.',
          icon: Key,
          colorClass: 'text-orange-600 dark:text-orange-400',
          bgColorClass: 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50'
        },
        {
          id: 'bike_rental',
          name: 'Bike Rental',
          description: 'Rent out robust two-wheelers tailored for rugged high-altitude Himalayan pathways.',
          icon: Bike,
          colorClass: 'text-rose-600 dark:text-rose-400',
          bgColorClass: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50'
        }
      ]
    },
    {
      categoryName: 'Travel Services',
      items: [
        {
          id: 'tour_operator',
          name: 'Tour Operator',
          description: 'Design and sell customizable multi-day itineraries, experiences, and holiday guides.',
          icon: Globe,
          colorClass: 'text-cyan-600 dark:text-cyan-400',
          bgColorClass: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-900/50'
        },
        {
          id: 'travel_agency',
          name: 'Travel Agency',
          description: 'Handle permit documentation, transport reservations, and local activity ticketing.',
          icon: Briefcase,
          colorClass: 'text-slate-600 dark:text-slate-400',
          bgColorClass: 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50'
        },
        {
          id: 'local_guide',
          name: 'Local Guide',
          description: 'Offer personal cultural tours, heritage walking treks, and rich localized storytelling.',
          icon: Compass,
          colorClass: 'text-sky-600 dark:text-sky-400',
          bgColorClass: 'bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/50'
        }
      ]
    },
    {
      categoryName: 'Food',
      items: [
        {
          id: 'restaurant',
          name: 'Restaurant',
          description: 'Run dine-in food establishments serving traditional Himalayan delicacies and global fares.',
          icon: Utensils,
          colorClass: 'text-emerald-750 dark:text-emerald-350',
          bgColorClass: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100/70'
        },
        {
          id: 'cafe',
          name: 'Cafe',
          description: 'Host cozy scenic mountain cafes with warm brews, local tea infusions, and baked treats.',
          icon: Coffee,
          colorClass: 'text-amber-750 dark:text-amber-350',
          bgColorClass: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-100/70'
        }
      ]
    },
    {
      categoryName: 'Activities',
      items: [
        {
          id: 'trek_organizer',
          name: 'Trek Organizer',
          description: 'Organize high-altitude treks, peak climbing expeditions, and secure mountain logistics.',
          icon: Mountain,
          colorClass: 'text-violet-600 dark:text-violet-400',
          bgColorClass: 'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/50'
        },
        {
          id: 'adventure_provider',
          name: 'Adventure Activity Provider',
          description: 'Host thrill activities like paragliding, river rafting, ziplines, or rock climbing.',
          icon: Flame,
          colorClass: 'text-red-600 dark:text-red-400',
          bgColorClass: 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50'
        }
      ]
    }
  ];

  const handleSelectBusiness = (id: string) => {
    setSelectedBusinessType(id);
    localStorage.setItem('hillytrip_selected_business_type', id);
  };

  const handleContinue = () => {
    if (selectedBusinessType) {
      setFlowState('onboarding');
    }
  };

  const handleBackToSelection = () => {
    setFlowState('selection');
  };

  // Find selected item details for rendering
  const allItems = businessCategories.flatMap(c => c.items);
  const currentItem = allItems.find(item => item.id === selectedBusinessType);

  if (flowState === 'onboarding' && selectedBusinessType) {
    // Dynamic architecture: Load configuration from businessConfigurations
    const selectedConfig = businessConfigurations[selectedBusinessType];

    if (selectedBusinessType === 'taxi_operator') {
      // If selectedBusinessType is Taxi Operator, load the existing Taxi onboarding exactly as it is
      return (
        <div className="relative">
          {/* Floating navigation header */}
          <div className="max-w-4xl mx-auto px-4 pt-6 -mb-6 relative z-10 flex justify-between items-center">
            <button
              onClick={handleBackToSelection}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Business Selection
            </button>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800">
              Onboarding: {selectedConfig?.name || 'Taxi Operator'}
            </span>
          </div>
          <TaxiOperatorOnboarding
            user={user}
            onUpdateUser={onUpdateUser}
            navigate={navigate}
            onOpenLoginModal={onOpenLoginModal}
          />
        </div>
      );
    } else {
      // For every other business type, load the configuration-driven UniversalOnboardingEngine
      return (
        <div className="relative">
          {/* Floating navigation header */}
          <div className="max-w-4xl mx-auto px-4 pt-6 -mb-6 relative z-10 flex justify-between items-center">
            <button
              onClick={handleBackToSelection}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Business Selection
            </button>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800">
              Onboarding: {selectedConfig?.name || selectedBusinessType}
            </span>
          </div>
          {selectedConfig ? (
            <UniversalOnboardingEngine
              configuration={selectedConfig}
              user={user}
              onUpdateUser={onUpdateUser}
              navigate={navigate}
              selectedBusinessType={selectedBusinessType}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-red-500 font-extrabold">Configuration not found for "{selectedBusinessType}"</p>
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 font-sans">
      {/* 1. Header Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5 mb-4">
            <Award className="w-3.5 h-3.5" /> HillyTrip Partner Circle
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Choose Your Business
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Select your primary business vertical to unlock custom mountain certification modules, secure traveler lead systems, and verified Himalayan listing badges.
          </p>
        </motion.div>
      </div>

      {/* 2. Business Categories Grid */}
      <div className="space-y-10">
        {businessCategories.map((category, catIdx) => (
          <motion.div
            key={category.categoryName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.08, duration: 0.3 }}
            className="space-y-4"
          >
            {/* Category Title Header */}
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {category.categoryName}
              </h2>
              <div className="h-[1px] bg-slate-200 dark:bg-slate-800/80 flex-1" />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.items.map((item) => {
                const isSelected = selectedBusinessType === item.id;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.id}
                    id={`business-card-${item.id}`}
                    onClick={() => handleSelectBusiness(item.id)}
                    className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ease-out cursor-pointer h-[190px] select-none ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-750 text-white shadow-lg scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border-slate-200/80 dark:border-slate-800 text-slate-800 hover:shadow-md hover:scale-[1.01]'
                    }`}
                  >
                    {/* Badge / Active state indicator */}
                    <div className="absolute top-4 right-4 transition-transform duration-200 group-hover:scale-110">
                      {isSelected ? (
                        <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-slate-400 transition" />
                      )}
                    </div>

                    {/* Card Icon & Metadata */}
                    <div className="space-y-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-white/10 border border-white/10' 
                          : item.bgColorClass + ' border'
                      }`}>
                        <IconComponent className={`w-5.5 h-5.5 ${isSelected ? 'text-white' : item.colorClass}`} />
                      </div>

                      <div className="space-y-1">
                        <h3 className={`font-extrabold text-sm tracking-tight ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition'}`}>
                          {item.name}
                        </h3>
                        <p className={`text-[11px] leading-relaxed line-clamp-3 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom visual aid */}
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-extrabold uppercase tracking-wider self-start transition-opacity duration-200">
                      {isSelected ? (
                        <span className="text-emerald-400 inline-flex items-center gap-1">
                          Active Selection <ChevronRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="opacity-0 group-hover:opacity-100 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 transition">
                          Select Provider <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Continue Actions Footer */}
      <AnimatePresence>
        {selectedBusinessType && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="mt-12 sticky bottom-6 left-0 right-0 z-20 max-w-2xl mx-auto"
          >
            <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-4 pl-6 flex items-center justify-between shadow-2xl border border-slate-850 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">Selected Business Type</span>
                <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {currentItem?.name || selectedBusinessType}
                </span>
              </div>

              <button
                onClick={handleContinue}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-lg shadow-emerald-900/10"
              >
                Continue to Onboarding
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
