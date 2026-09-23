import React, { useState } from 'react';
import { SmartPageAssembler } from './SmartPageAssembler';
import { ContentAdminCMS } from './ContentAdminCMS';
import { Sparkles, Layers, ShieldCheck, Compass } from 'lucide-react';

interface ContentIntelligenceHubProps {
  initialTab?: 'assembler' | 'admin';
  onNavigate?: (path: string) => void;
}

export const ContentIntelligenceHub: React.FC<ContentIntelligenceHubProps> = ({
  initialTab = 'assembler',
  onNavigate
}) => {
  const [activeView, setActiveView] = useState<'assembler' | 'admin'>(initialTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6">
      {/* Platform Navigation Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">HillyTrip Content Intelligence Platform</h2>
              <p className="text-xs text-slate-400">Universal CMS, Auto-Relationship Engine & SEO Schema Generator</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveView('assembler')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeView === 'assembler' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              Smart Page Assembler
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeView === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              CMS Admin Platform
            </button>
          </div>
        </div>
      </div>

      {activeView === 'assembler' ? (
        <SmartPageAssembler onNavigate={onNavigate} />
      ) : (
        <ContentAdminCMS />
      )}
    </div>
  );
};
