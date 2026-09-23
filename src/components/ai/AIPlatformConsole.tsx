import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Server, Cpu, Database, Activity, FileText, 
  Settings, DollarSign, RefreshCw, CheckCircle2, AlertTriangle, 
  BarChart2, Search, ArrowUpRight, ShieldAlert, Edit3, Save, RotateCcw,
  BookOpen, Layers
} from 'lucide-react';
import { 
  AIObservabilitySummary, AIPromptTemplate, AIModelConfig, 
  KnowledgeItem, AIAdminInsights, AIContentAssistance 
} from '../../types/aiPlatform';
import { AIBusinessAssistantView } from './AIBusinessAssistantView';

interface AIPlatformConsoleProps {
  onNavigate?: (path: string) => void;
}

export const AIPlatformConsole: React.FC<AIPlatformConsoleProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'gateway' | 'prompts' | 'observability' | 'knowledge' | 'insights' | 'content'>('gateway');

  // Telemetry state
  const [observability, setObservability] = useState<AIObservabilitySummary | null>(null);
  const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);
  const [providers, setProviders] = useState<AIModelConfig[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [adminInsights, setAdminInsights] = useState<AIAdminInsights | null>(null);

  // Edit prompt state
  const [selectedPrompt, setSelectedPrompt] = useState<AIPromptTemplate | null>(null);
  const [editedPromptText, setEditedPromptText] = useState('');
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  // Content assistant state
  const [contentSnippetInput, setContentSnippetInput] = useState('Sitong is a beautiful orange village in Kurseong division with great homestays.');
  const [contentResult, setContentResult] = useState<AIContentAssistance | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [obsRes, promptRes, provRes, knowRes, insRes] = await Promise.all([
        fetch('/api/ai/observability'),
        fetch('/api/ai/prompts'),
        fetch('/api/ai/providers'),
        fetch('/api/ai/knowledge'),
        fetch('/api/ai/admin-insights')
      ]);

      if (obsRes.ok) setObservability(await obsRes.ok ? await obsRes.json() : null);
      if (promptRes.ok) {
        const prList = await promptRes.json();
        setPrompts(prList);
        if (prList.length > 0) {
          setSelectedPrompt(prList[0]);
          setEditedPromptText(prList[0].templateText);
        }
      }
      if (provRes.ok) setProviders(await provRes.json());
      if (knowRes.ok) setKnowledgeItems(await knowRes.json());
      if (insRes.ok) {
        const ins = await insRes.json();
        if (ins.structuredData) setAdminInsights(ins.structuredData);
      }
    } catch (err) {
      console.error('[AIPlatformConsole] Error fetching platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!selectedPrompt) return;
    setIsSavingPrompt(true);
    try {
      const res = await fetch(`/api/ai/prompts/${selectedPrompt.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateText: editedPromptText, updatedBy: 'Admin Console' })
      });

      if (res.ok) {
        const updated = await res.json();
        setPrompts(prev => prev.map(p => p.slug === updated.slug ? updated : p));
        setSelectedPrompt(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleRunContentAssist = async () => {
    setIsContentLoading(true);
    try {
      const res = await fetch('/api/ai/content-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentSnippet: contentSnippetInput })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.structuredData) {
          setContentResult(data.structuredData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsContentLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Platform Title Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Intelligence Engine v2.5
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Provider Agnostic
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">HillyTrip AI Intelligence Platform Console</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">Central control plane for AI Gateway, multi-provider routing, prompt engineering, HillyTrip ground knowledge layer, and operational insights.</p>
        </div>

        <button
          onClick={fetchInitialData}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-rose-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'gateway', label: 'AI Gateway & Providers', icon: Server },
          { id: 'prompts', label: 'Prompt Library', icon: Edit3 },
          { id: 'observability', label: 'Observability & Costs', icon: BarChart2 },
          { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
          { id: 'insights', label: 'Admin Insights & Search Gaps', icon: ShieldAlert },
          { id: 'content', label: 'Content Assistant', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI GATEWAY & PROVIDERS */}
      {activeTab === 'gateway' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase">Primary Active Provider</div>
              <div className="text-xl font-black text-emerald-400 mt-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Google Gemini 2.5 Flash
              </div>
              <p className="text-xs text-slate-500 mt-2">Zero-latency streaming with primary knowledge RAG grounding</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase">Automated Fallback Chain</div>
              <div className="text-base font-bold text-white mt-2 font-mono">Gemini → OpenAI GPT-4o → Claude 3.5</div>
              <p className="text-xs text-slate-500 mt-2">Guarantees 99.9% uptime if any API endpoint drops</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase">Gateway Rate Limiting</div>
              <div className="text-xl font-black text-rose-400 mt-2">30 Req/Min Per User</div>
              <p className="text-xs text-slate-500 mt-2">Token bucket algorithm with IP session throttling</p>
            </div>
          </div>

          {/* Model Registry Cards */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" /> Multi-Provider Interface Configurations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((prov) => (
                <div key={prov.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{prov.displayName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      prov.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {prov.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 font-mono">
                    <div>Input: ${prov.costPer1kInputUSD} / 1k tokens</div>
                    <div>Output: ${prov.costPer1kOutputUSD} / 1k tokens</div>
                    <div>Max Output: {prov.maxTokens} tokens</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Role: {prov.isFallback ? 'Fallback Provider' : 'Primary Gateway'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CENTRAL PROMPT LIBRARY */}
      {activeTab === 'prompts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prompt Templates</h3>
            <div className="space-y-2">
              {prompts.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => {
                    setSelectedPrompt(p);
                    setEditedPromptText(p.templateText);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl text-xs transition-all cursor-pointer border ${
                    selectedPrompt?.slug === p.slug 
                      ? 'bg-rose-500/10 border-rose-500/50 text-white font-bold' 
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{p.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">v{p.version}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            {selectedPrompt ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedPrompt.title}</h3>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono rounded font-extrabold">
                        v{selectedPrompt.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{selectedPrompt.description}</p>
                  </div>

                  <button
                    onClick={handleSavePrompt}
                    disabled={isSavingPrompt}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSavingPrompt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save & Version Prompt</span>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">System Instruction Template</label>
                  <textarea
                    rows={12}
                    value={editedPromptText}
                    onChange={(e) => setEditedPromptText(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-rose-500 leading-relaxed"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Variables: {selectedPrompt.variables.join(', ')}</span>
                  <span>Last modified: {new Date(selectedPrompt.updatedAt).toLocaleDateString()}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">Select a prompt template from the left list to view or edit.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OBSERVABILITY & TELEMETRY */}
      {activeTab === 'observability' && observability && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total AI Requests</div>
              <div className="text-2xl font-black text-white mt-1">{observability.totalRequestsCount}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Input / Output Tokens</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{observability.totalInputTokens + observability.totalOutputTokens}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Est. Cost (USD)</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">${observability.totalEstimatedCostUSD}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Avg Latency</div>
              <div className="text-2xl font-black text-sky-400 mt-1">{observability.avgLatencyMs} ms</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Cache Hit Rate</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{observability.cacheHitPercentage}%</div>
            </div>
          </div>

          {/* Recent Logs Table */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent AI Gateway Request Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Tokens</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Est. Cost</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {observability.recentRequestsLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-mono text-slate-300">{log.id}</td>
                      <td className="p-3 font-bold text-rose-300">{log.requestType}</td>
                      <td className="p-3 font-semibold uppercase text-emerald-400">{log.providerUsed}</td>
                      <td className="p-3 text-slate-300">{log.tokensUsed.totalTokens}</td>
                      <td className="p-3 text-slate-300">{log.latencyMs}ms</td>
                      <td className="p-3 font-mono text-emerald-400">${log.estimatedCostUSD}</td>
                      <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE LAYER INSPECTOR */}
      {activeTab === 'knowledge' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" /> HillyTrip Ground Knowledge Index
            </h3>
            <span className="text-xs text-slate-400">{knowledgeItems.length} Ground Context Records Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeItems.map((item) => (
              <div key={item.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{item.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{item.summary}</p>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN INSIGHTS & SEARCH GAPS */}
      {activeTab === 'insights' && adminInsights && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Strategic Operational Recommendations
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {adminInsights.platformRecommendationSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Inventory Gaps */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Unfulfilled Search Inventory Gaps</h4>
              <div className="space-y-3">
                {adminInsights.searchGaps.map((gap, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">"{gap.query}"</div>
                      <div className="text-slate-400 text-[11px]">Needed: {gap.missingInventoryType}</div>
                    </div>
                    <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {gap.priority} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fraud Indicators */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Fraud & Security Anomalies</h4>
              <div className="space-y-3">
                {adminInsights.fraudIndicators.map((f, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400">{f.entityType} ({f.entityId})</span>
                      <span className="text-rose-400 font-extrabold">Risk Score: {f.riskScore}%</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{f.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONTENT ASSISTANT FOR EDITORS */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" /> AI Content & SEO Assistant (Editorial Review Only)
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Content Snippet To Analyze</label>
              <textarea
                rows={3}
                value={contentSnippetInput}
                onChange={(e) => setContentSnippetInput(e.target.value)}
                className="w-full bg-slate-950 text-white p-4 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleRunContentAssist}
              disabled={isContentLoading}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              {isContentLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate SEO & Summary Suggestions</span>
            </button>
          </div>

          {contentResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                  SEO Title Ideas
                </span>
                <ul className="mt-2 space-y-1 text-xs text-white">
                  {contentResult.titleSuggestions.map((title, i) => (
                    <li key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-semibold">• {title}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  SEO Meta Description
                </span>
                <p className="mt-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">{contentResult.seoMetaDescription}</p>
              </div>
            </motion.div>
          )}

          <AIBusinessAssistantView />
        </div>
      )}
    </div>
  );
};
