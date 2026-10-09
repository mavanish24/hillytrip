import React, { useState } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  Car, 
  Home, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { User, Hub, Destination } from '../types';

interface RegionalContributorDeskProps {
  user: User | null;
  hubs?: Hub[];
  destinations?: Destination[];
  navigate: (path: string) => void;
  setNotification?: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
}

export const RegionalContributorDesk: React.FC<RegionalContributorDeskProps> = ({
  user,
  hubs = [],
  destinations = [],
  navigate,
  setNotification
}) => {
  const [contributionType, setContributionType] = useState<
    'add_route' | 'correct_route' | 'report_missing_route' | 'add_attraction' | 'add_homestay' | 'upload_photo'
  >('add_route');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const payload: Record<string, any> = {
        type: contributionType,
        submittedAt: new Date().toISOString(),
        userId: user?.id || user?.email || 'anonymous-contributor',
        userName: user?.name || user?.email || 'Community Member'
      };

      formData.forEach((val, key) => {
        payload[key] = val;
      });

      // Persist in local storage
      const existing = JSON.parse(localStorage.getItem('hillytrip_community_contributions') || '[]');
      existing.unshift(payload);
      localStorage.setItem('hillytrip_community_contributions', JSON.stringify(existing.slice(0, 50)));

      setSubmitted(true);
      if (setNotification) {
        setNotification({
          type: 'success',
          message: 'Contribution successfully recorded! Our regional editorial desk will verify the report.'
        });
      }
    } catch (err) {
      console.error('Contribution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contribute-view" className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Regional Contributor Desk
          </h1>
          <p className="text-slate-650 dark:text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Help fellow travelers navigate the Himalayas. Submit updated road fares, report newly opened homestays, or flag missing transit routes.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thank You for Your Contribution!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your field update has been logged into the regional queue. Once verified by local operators, it will appear live across HillyTrip.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Submit Another Update
              </button>
              <button
                onClick={() => navigate('/community')}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Return to Community Hub
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Select Contribution Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'add_route', label: 'Add New Route', icon: Car },
                  { id: 'correct_route', label: 'Update Taxi Fare', icon: ShieldCheck },
                  { id: 'report_missing_route', label: 'Missing Transit', icon: MapPin },
                  { id: 'add_homestay', label: 'Report Homestay', icon: Home },
                  { id: 'add_attraction', label: 'New Attraction', icon: Sparkles },
                  { id: 'upload_photo', label: 'Field Photo', icon: Camera }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setContributionType(id as any)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      contributionType === id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Form Fields */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Origin / Location Name *
                  </label>
                  <input
                    name="locationName"
                    required
                    placeholder="e.g. NJP Station, Darjeeling Motor Stand, Yuksom"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Destination / Target Point
                  </label>
                  <input
                    name="destinationName"
                    placeholder="e.g. Lamahatta, Chatakpur, Ravangla"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Shared Fare (₹) or Rate
                  </label>
                  <input
                    name="fare"
                    type="number"
                    placeholder="e.g. 250"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Type / Operator
                  </label>
                  <input
                    name="vehicleType"
                    placeholder="e.g. Bolero / Sumo, Shared Taxi Stand"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Field Notes & Transit Instructions *
                </label>
                <textarea
                  name="notes"
                  required
                  rows={4}
                  placeholder="e.g. Shared jeeps leave between 7:00 AM and 2:00 PM from the lower syndicate stand. Road is newly paved."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name / Contributor Handle
                </label>
                <input
                  name="contributorName"
                  defaultValue={user?.name || ''}
                  placeholder="e.g. Tenzing Norbu / Local Guide"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting Report...' : 'Submit Field Contribution'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegionalContributorDesk;
