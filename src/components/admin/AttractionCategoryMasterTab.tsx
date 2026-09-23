import React, { useState, useEffect } from 'react';
import { 
  Lock, ShieldCheck, Database, Search, Sparkles, CheckCircle2, 
  Layers, ArrowRight, Info, AlertTriangle, ListOrdered, Check,
  Mountain, Eye, Droplets, Waves, Trees, Bug, Leaf, Flower2,
  Footprints, Tent, Landmark, Flame, Church, Shield, Home,
  Navigation2, CableCar, Train, MountainSnow, Sun, Palette,
  ShoppingBag, HelpCircle, Copy, Cpu, Play, RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  ATTRACTION_CATEGORIES_MASTER, 
  ATTRACTION_CATEGORIES_METADATA, 
  AttractionMasterCategory,
  normalizeAttractionCategory,
  classifyAttractionRecord,
  ATTRACTION_AI_CLASSIFICATION_PROMPT_GUIDE
} from '../../constants/attractionCategories';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Mountain,
  Eye,
  Droplets,
  Waves,
  Trees,
  Bug,
  Leaf,
  Flower2,
  Footprints,
  Tent,
  Landmark,
  Flame,
  Church,
  Shield,
  Home,
  Navigation2,
  CableCar,
  Train,
  MountainSnow,
  Sparkles,
  Sun,
  Palette,
  ShoppingBag,
  HelpCircle
};

export const AttractionCategoryMasterTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AttractionMasterCategory | null>(null);
  
  // Normalization Test Sandbox
  const [testInputName, setTestInputName] = useState('');
  const [testInputRawCategory, setTestInputRawCategory] = useState('');
  const [testInputDescription, setTestInputDescription] = useState('');
  const [testInputVillage, setTestInputVillage] = useState('');
  const [sandboxResult, setSandboxResult] = useState<{
    normalized: AttractionMasterCategory | null;
    status: 'AUTO_ASSIGNED' | 'NEEDS_REVIEW';
    reason: string;
    isExactMatch: boolean;
  } | null>(null);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Live Database Stats
  const [dbStats, setDbStats] = useState<{
    total_staged: number;
    total_processed: number;
    pending_count: number;
    auto_assigned_count: number;
    needs_review_count: number;
    category_counts: Record<string, number>;
    needs_review_records: Array<{
      attraction_name: string;
      village_name: string;
      category: string;
      category_reason: string;
    }>;
    is_complete: boolean;
  } | null>(null);

  // Batch Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState<{
    batch_processed_count?: number;
    batch_updated_count?: number;
    pending_before?: number;
    pending_after?: number;
    total_staged: number;
    total_processed: number;
    auto_assigned_count: number;
    needs_review_count: number;
    category_counts: Record<string, number>;
    needs_review_records: Array<{
      attraction_name: string;
      village_name: string;
      category: string;
      category_reason: string;
    }>;
  } | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  const fetchLiveStats = async () => {
    try {
      const res = await fetch('/api/admin/attractions-new/normalization-stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDbStats(data);
          if (!batchResults) {
            setBatchResults(data);
          }
        }
      }
    } catch (err) {
      console.warn('[Category Master] Could not pull live DB normalization stats:', err);
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  // Filtered categories for search
  const filteredCategories = ATTRACTION_CATEGORIES_METADATA.filter(cat => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.id.toString() === q ||
      cat.description.toLowerCase().includes(q) ||
      cat.keywords.some(k => k.toLowerCase().includes(q)) ||
      cat.examples.some(e => e.toLowerCase().includes(q))
    );
  });

  const handleRunSandbox = () => {
    if (!testInputName && !testInputRawCategory && !testInputDescription && !testInputVillage) return;
    const classification = classifyAttractionRecord({
      attraction_name: testInputName,
      description: testInputDescription,
      village_name: testInputVillage,
      category: testInputRawCategory
    });
    const isExact = (ATTRACTION_CATEGORIES_MASTER as readonly string[]).includes(testInputRawCategory.trim());
    setSandboxResult({ 
      normalized: classification.normalized_category, 
      status: classification.category_status,
      reason: classification.category_reason,
      isExactMatch: isExact 
    });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(ATTRACTION_AI_CLASSIFICATION_PROMPT_GUIDE);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText('GRANT ALL ON TABLE public.attractions_new TO postgres, anon, authenticated, service_role;');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTriggerBatch = async () => {
    setIsProcessing(true);
    setBatchError(null);
    try {
      console.log('[Batch Normalization UI] Triggering Category Normalization Batch...');
      const res = await fetch('/api/admin/attractions-new/process-category-normalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 1000 })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        const errMsg = data.message || data.error || 'Batch processing encountered an error';
        console.error('[Batch Normalization Error]', errMsg);
        setBatchError(errMsg);
      } else {
        console.log('[Batch Normalization Result]:', {
          'pending count before processing': data.pending_before,
          'IDs/record count selected': data.batch_processed_count,
          'number successfully classified': data.batch_processed_count,
          'number successfully updated': data.batch_updated_count,
          'pending count after processing': data.pending_after,
          'total staged': data.total_staged,
          'total processed': data.total_processed,
          'auto assigned': data.auto_assigned_count,
          'needs review': data.needs_review_count
        });
        setBatchResults(data);
        setDbStats(data);
      }
    } catch (err: any) {
      console.error('[Batch Normalization Fetch Exception]', err);
      setBatchError(err.message || 'Failed to trigger batch processing');
    } finally {
      setIsProcessing(false);
      fetchLiveStats();
    }
  };

  const totalStagedCount = dbStats?.total_staged ?? batchResults?.total_staged ?? 3020;
  const totalProcessedCount = dbStats?.total_processed ?? batchResults?.total_processed ?? 0;
  const pendingCount = dbStats?.pending_count ?? ((batchResults?.pending_after !== undefined) ? batchResults.pending_after : (totalStagedCount - totalProcessedCount));
  const isAllComplete = pendingCount === 0 && totalProcessedCount > 0;

  return (
    <div id="attraction-category-master-tab" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ListOrdered className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Attraction Category Master
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Lock className="w-3.5 h-3.5" /> Fixed Master (Exactly 24 Categories)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Strict normalization taxonomy for all attraction classification across HillyTrip. These 24 categories are locked and represent the only selectable and AI-classifiable categories for all future attraction records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Staged Records</div>
              <div className="text-lg font-black text-amber-400 flex items-center gap-2">
                <span>{totalStagedCount.toLocaleString()}</span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  public.attractions_new
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Governance & Rule Safeguards Banner */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 border-t border-slate-800/80">
          <div className="flex items-start gap-3 bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Strict Master Integrity</span>
              <span className="text-slate-400">Zero custom categories allowed. No renames or additions permitted.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl">
            <Database className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Category Normalization Only</span>
              <span className="text-slate-400">No geocoding, duplicate detection, or record deletion will take place.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Deterministic AI Classification</span>
              <span className="text-slate-400">Classification strictly writes normalized_category, category_status, and category_reason.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Processing Execution Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              Category Normalization Batch Processor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Processes staged records in <code className="text-amber-300 font-mono">public.attractions_new</code> to assign <code className="text-emerald-300 font-mono">normalized_category</code>, <code className="text-sky-300 font-mono">category_status</code>, and <code className="text-purple-300 font-mono">category_reason</code>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-trigger-batch-normalization"
              onClick={handleTriggerBatch}
              disabled={isProcessing || isAllComplete}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-950"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : isAllComplete ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Play className="w-3.5 h-3.5" />}
              <span>
                {isProcessing 
                  ? 'Processing Batch (up to 1,000 records)...' 
                  : isAllComplete 
                    ? 'All Records Normalized (0 Pending)' 
                    : `Run Category Normalization Batch (${pendingCount.toLocaleString()} pending)`}
              </span>
            </button>
          </div>
        </div>

        {batchError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4" />
              <span>Database Access Notice:</span>
            </div>
            <p>{batchError}</p>
            <div className="bg-slate-950 p-3 rounded-lg border border-amber-500/20 font-mono text-[11px] text-amber-100 flex items-center justify-between gap-2">
              <span>GRANT ALL ON TABLE public.attractions_new TO postgres, anon, authenticated, service_role;</span>
              <button 
                onClick={handleCopySql} 
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[10px] shrink-0 cursor-pointer"
              >
                {copiedSql ? 'Copied' : 'Copy SQL'}
              </button>
            </div>
          </div>
        )}

        {(batchResults || dbStats) && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Processed</div>
                <div className="text-xl font-black text-white">{(dbStats?.total_processed ?? batchResults?.total_processed ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-amber-400 uppercase">Pending</div>
                <div className="text-xl font-black text-amber-400">{pendingCount.toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">AUTO_ASSIGNED</div>
                <div className="text-xl font-black text-emerald-400">{(dbStats?.auto_assigned_count ?? batchResults?.auto_assigned_count ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 border border-purple-500/30 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-purple-400 uppercase">NEEDS_REVIEW</div>
                <div className="text-xl font-black text-purple-400">{(dbStats?.needs_review_count ?? batchResults?.needs_review_count ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-sky-400 uppercase">Distinct Master Cats</div>
                <div className="text-xl font-black text-sky-400">
                  {Object.values(dbStats?.category_counts ?? batchResults?.category_counts ?? {}).filter(c => c > 0).length} / 24
                </div>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-300 border-b border-slate-800">
                Breakdown by Master Category (24 Categories)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3 bg-slate-950/50 max-h-60 overflow-y-auto">
                {ATTRACTION_CATEGORIES_MASTER.map((cat, idx) => {
                  const currentCounts = dbStats?.category_counts ?? batchResults?.category_counts ?? {};
                  const count = currentCounts[cat] || 0;
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs">
                      <span className="text-slate-300 truncate mr-2" title={cat}>{cat}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        count > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-950 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Needs Review Items */}
            {(batchResults?.needs_review_records?.length ?? 0) > 0 && (
              <div className="border border-amber-500/30 rounded-xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 bg-amber-500/10 text-amber-300 text-xs font-bold border-b border-amber-500/20 flex items-center justify-between">
                  <span>NEEDS_REVIEW Records ({batchResults!.needs_review_records.length})</span>
                  <span className="text-[10px] font-normal text-amber-200">normalized_category = NULL</span>
                </div>
                <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
                  {batchResults!.needs_review_records.map((rec, idx) => (
                    <div key={idx} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-white">{rec.attraction_name}</div>
                        <div className="text-slate-400 text-[11px]">Village: {rec.village_name} | Original Category: {rec.category}</div>
                      </div>
                      <div className="text-amber-400 text-[11px] sm:text-right max-w-sm">
                        {rec.category_reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Categories Master List (Left) + Sandbox & Constraints (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 24 Categories Directory */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Master Taxonomy ({filteredCategories.length} / 24)
              </h3>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-categories-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories, keywords..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCategories.map((cat) => {
              const IconComponent = ICON_MAP[cat.icon] || HelpCircle;
              const isSelected = selectedCategory === cat.name;

              return (
                <div
                  key={cat.id}
                  id={`category-card-${cat.id}`}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/30' 
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400 shrink-0">
                        {cat.id.toString().padStart(2, '0')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-slate-400" />
                          <h4 className="text-sm font-black text-white">
                            {cat.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          slug: {cat.slug}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                      Fixed
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Examples:</span>
                    {cat.examples.slice(0, 2).map((ex, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-950/60 text-slate-300 border border-slate-800/80">
                        {ex}
                      </span>
                    ))}
                    {cat.examples.length > 2 && (
                      <span className="text-[10px] text-slate-400">
                        +{cat.examples.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Sandbox & Strict System Prompt Spec */}
        <div className="lg:col-span-4 space-y-4">
          {/* Real-time Category Normalization Sandbox */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Category Normalizer Sandbox
              </h3>
              <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                Rule Engine Preview
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Test how any raw imported attraction record is deterministically normalized into one of the 24 Master Categories.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Attraction Name
                </label>
                <input
                  type="text"
                  value={testInputName}
                  onChange={(e) => setTestInputName(e.target.value)}
                  placeholder="e.g. Changey Falls or Tiger Hill Observatory"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Raw Category (Source)
                </label>
                <input
                  type="text"
                  value={testInputRawCategory}
                  onChange={(e) => setTestInputRawCategory(e.target.value)}
                  placeholder="e.g. Waterfall / Falls, Hill Top, Religious"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={testInputDescription}
                  onChange={(e) => setTestInputDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. A roaring 300m waterfall surrounded by dense rhododendron forests..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Village / Location Name
                </label>
                <input
                  type="text"
                  value={testInputVillage}
                  onChange={(e) => setTestInputVillage(e.target.value)}
                  placeholder="e.g. Pelling, Yuksom, Lava"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSandbox}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Classification</span>
              </button>
            </div>

            {/* Sandbox Output */}
            {sandboxResult && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classification Result</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    sandboxResult.status === 'AUTO_ASSIGNED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {sandboxResult.status}
                  </span>
                </div>

                <div className="text-sm font-black text-white flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sandboxResult.normalized || 'Unassigned (Needs Manual Review)'}</span>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="font-bold text-slate-300 block mb-0.5">Reason / Rule Matched:</span>
                  {sandboxResult.reason}
                </div>
              </div>
            )}
          </div>

          {/* AI LLM Classification Prompt Spec */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                AI Prompt System Constraint
              </h3>
              <button
                onClick={handleCopyPrompt}
                className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 border border-slate-800 cursor-pointer"
              >
                {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPrompt ? 'Copied' : 'Copy Guide'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Embed this locked prompt guideline in all LLM classification pipelines to ensure 100% adherence to the 24 Master Categories without hallucinations.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">{ATTRACTION_AI_CLASSIFICATION_PROMPT_GUIDE}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

