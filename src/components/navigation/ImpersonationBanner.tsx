import React, { useState, useEffect } from 'react';
import { roleService, ImpersonationState } from '../../services/navigation/RoleService';
import { Shield, Eye, LogOut, Lock, Sparkles, Terminal, FileText } from 'lucide-react';

interface ImpersonationBannerProps {
  onNavigate?: (path: string) => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ onNavigate }) => {
  const [state, setState] = useState<ImpersonationState>(roleService.getImpersonationState());

  useEffect(() => {
    return roleService.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  if (!state.isImpersonating) {
    return null; // Do not display if in native Super Admin mode
  }

  const roleLabels: Record<string, string> = {
    GUEST: 'Guest Traveller',
    TRAVELLER: 'Traveller',
    BUSINESS_OWNER: 'Business Owner',
    HOMESTAY_OWNER: 'Homestay Owner',
    TAXI_OPERATOR: 'Taxi Operator',
    GUIDE: 'Mountain Guide',
    CONTENT_EDITOR: 'Content Editor',
    MODERATOR: 'Community Moderator',
    ADMIN: 'Platform Admin',
    SUPER_ADMIN: 'Super Admin'
  };

  const formattedRole = roleLabels[state.activeRole] || state.activeRole;
  const targetName = state.impersonatedUser ? state.impersonatedUser.name : null;

  return (
    <div className="sticky top-0 z-[9999] w-full bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 text-white shadow-xl border-b border-white/20 px-3 py-2 text-xs font-bold transition-all animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Role / User Indicator */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-black/30 border border-white/30 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-black uppercase tracking-wider text-amber-200 border border-amber-400/30">
              VIEW MODE ONLY
            </span>

            <span className="truncate font-extrabold text-white">
              🛡 Viewing as <span className="underline decoration-amber-300 decoration-2 font-black">{formattedRole}</span>
              {targetName && (
                <span className="ml-1 text-amber-100 font-semibold">
                  ({targetName})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={() => onNavigate ? onNavigate('#/admin/audit') : (window.location.hash = '#/admin/audit')}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-amber-200 border border-white/20 text-[11px] font-bold transition-colors cursor-pointer"
            title="View Role Audit Trail"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('#/admin/dev-tools') : (window.location.hash = '#/admin/dev-tools')}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-indigo-200 border border-white/20 text-[11px] font-bold transition-colors cursor-pointer"
            title="Open Developer Console"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Dev Tools</span>
          </button>

          <button
            onClick={() => roleService.exitImpersonation()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-slate-950 hover:bg-amber-100 font-black text-[11px] shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Exit View Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
