import React, { useState } from 'react';
import { 
  FileCheck, ToggleLeft, ToggleRight, Settings, 
  ShieldAlert, RefreshCw, CheckCircle2, Globe 
} from 'lucide-react';
import { FeatureFlag, GlobalPlatformSetting } from '../../types/admin';

interface FeatureFlagsSettingsTabProps {
  flags: FeatureFlag[];
  settings: GlobalPlatformSetting[];
  onToggleFlag: (key: string, enabled: boolean) => void;
  onUpdateSetting: (key: string, value: any) => void;
  onRefresh: () => void;
}

export const FeatureFlagsSettingsTab: React.FC<FeatureFlagsSettingsTabProps> = ({
  flags,
  settings,
  onToggleFlag,
  onUpdateSetting,
  onRefresh
}) => {
  const [commissionVal, setCommissionVal] = useState<number>(12.5);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-purple-400" />
            Global Feature Flags & Platform Parameters
          </h2>
          <p className="text-xs text-slate-400">Configure feature deployment rollout gates, commission percentages, and emergency maintenance controls.</p>
        </div>

        <button 
          onClick={onRefresh}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Feature Flags List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          Active Feature Rollout Gates
        </h3>

        <div className="space-y-3">
          {flags.map(flag => (
            <div key={flag.key} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{flag.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300">
                    {flag.key}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{flag.description}</p>
                {flag.rolledOutDistricts && flag.rolledOutDistricts.length > 0 && (
                  <div className="text-[10px] text-slate-500">
                    Active in: {flag.rolledOutDistricts.join(', ')}
                  </div>
                )}
              </div>

              <button
                onClick={() => onToggleFlag(flag.key, !flag.enabled)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                  flag.enabled 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {flag.enabled ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                    ENABLED
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-slate-500" />
                    DISABLED
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-400" />
          Global Platform Rules & Maintenance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white">Platform Booking Commission</div>
            <p className="text-xs text-slate-400">Default percentage fee retained on all homestay and cab transactions.</p>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                step="0.5"
                value={commissionVal}
                onChange={(e) => setCommissionVal(parseFloat(e.target.value) || 0)}
                className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-xs text-slate-400">%</span>
              <button 
                onClick={() => onUpdateSetting('platform_commission_pct', commissionVal)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Save Rate
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white">Maintenance Mode Override</div>
            <p className="text-xs text-slate-400">Puts consumer apps into read-only mode during database migrations.</p>
            <button 
              onClick={() => onUpdateSetting('maintenance_mode', false)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold cursor-pointer"
            >
              System Operational (Normal)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
