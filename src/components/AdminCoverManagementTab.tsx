import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  Upload, 
  Search, 
  Filter, 
  Check, 
  Image as ImageIcon, 
  AlertTriangle, 
  FileText,
  Loader2,
  Save,
  Grid
} from "lucide-react";

interface AdminCoverManagementTabProps {
  adminEmail?: string;
}

export const AdminCoverManagementTab: React.FC<AdminCoverManagementTabProps> = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "destinations" | "attractions">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "generated" | "failed" | "manual">("all");
  const [savingPromptId, setSavingPromptId] = useState<string | null>(null);
  const [generatingRowId, setGeneratingRowId] = useState<string | null>(null);
  const [regeneratingRowId, setRegeneratingRowId] = useState<string | null>(null);
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [unsplashProcessing, setUnsplashProcessing] = useState(false);
  const [unsplashOverwrite, setUnsplashOverwrite] = useState(false);
  
  // Credentials checking states
  const [configChecked, setConfigChecked] = useState(false);
  const [configStatus, setConfigStatus] = useState<{ configured: boolean; reason?: string; message?: string } | null>(null);
  
  // Notification alert state
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const checkConfig = async () => {
    try {
      const res = await fetch("/api/admin/cover/config-check", {
        headers: {
          "x-admin-password": "admin123"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch (e) {
      console.error("Config check failed:", e);
    } finally {
      setConfigChecked(true);
    }
  };

  // Fetch both destinations and attractions from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [destRes, attrRes] = await Promise.all([
        fetch("/api/destinations"),
        fetch("/api/attractions")
      ]);

      if (!destRes.ok || !attrRes.ok) {
        throw new Error("Failed to load destinations or attractions");
      }

      const dests = await destRes.json();
      const attrs = await attrRes.json();

      // Tag type to differentiate in unified list
      const taggedDests = dests.map((d: any) => ({ ...d, _type: "destinations" }));
      const taggedAttrs = attrs.map((a: any) => ({ ...a, _type: "attractions" }));

      setItems([...taggedDests, ...taggedAttrs]);
    } catch (err: any) {
      showNotification("error", err.message || "Network error loading master data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    checkConfig();
  }, []);

  // Update a row in the local list
  const updateLocalRow = (id: string, updatedRecord: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedRecord };
      }
      return item;
    }));
  };

  // 1. Generate Cover Image from prompt
  const handleGenerateCover = async (record: any) => {
    setGeneratingRowId(record.id);
    try {
      const res = await fetch("/api/admin/cover/generate-image", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-password": "admin123"
        },
        body: JSON.stringify({ id: record.id, type: record._type })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Image generation failed.");
      }

      updateLocalRow(record.id, data.record);
      showNotification("success", `Cover successfully generated for "${record.name}"!`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to generate cover.");
      // Set failed locally
      updateLocalRow(record.id, { ...record, coverStatus: "failed" });
    } finally {
      setGeneratingRowId(null);
    }
  };

  // 2. Regenerate prompt
  const handleRegeneratePrompt = async (record: any) => {
    setRegeneratingRowId(record.id);
    try {
      const res = await fetch("/api/admin/cover/regenerate-prompt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-password": "admin123"
        },
        body: JSON.stringify({ id: record.id, type: record._type })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Prompt generation failed.");
      }

      updateLocalRow(record.id, data.record);
      showNotification("success", `AI prompt regenerated for "${record.name}"!`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to regenerate prompt.");
    } finally {
      setRegeneratingRowId(null);
    }
  };

  // 3. Save manually edited prompt
  const handleSaveEditedPrompt = async (record: any, promptText: string) => {
    setSavingPromptId(record.id);
    try {
      // Put directly to collections data update API 
      const res = await fetch(`/api/admin/data/${record._type}/${record.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-password": "admin123"
        },
        body: JSON.stringify({ coverPrompt: promptText, coverStatus: record.coverStatus || "pending" })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save edited prompt");
      }

      updateLocalRow(record.id, { ...record, coverPrompt: promptText });
      showNotification("success", "Saved prompt text successfully.");
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update prompt.");
    } finally {
      setSavingPromptId(null);
    }
  };

  // 4. File picker trigger
  const triggerFileSelect = (id: string) => {
    fileInputRefs.current[id]?.click();
  };

  // 5. File upload transfer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, record: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRowId(record.id);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        if (!base64String) {
          showNotification("error", "Failed to read image file.");
          setUploadingRowId(null);
          return;
        }

        const res = await fetch("/api/admin/cover/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-password": "admin123"
          },
          body: JSON.stringify({ 
            id: record.id, 
            type: record._type, 
            coverImage: base64String 
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to upload manual cover.");
        }

        updateLocalRow(record.id, data.record);
        showNotification("success", `Manual cover image uploaded for "${record.name}"!`);
        setUploadingRowId(null);
      };
      
      reader.onerror = () => {
        showNotification("error", "File reading error.");
        setUploadingRowId(null);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to process image.");
      setUploadingRowId(null);
    }
  };

  // Drag and drop events for drop-zone container
  const [dragActiveRowId, setDragActiveRowId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragActiveRowId(id);
  };

  const handleDragLeave = () => {
    setDragActiveRowId(null);
  };

  const handleDrop = async (e: React.DragEvent, record: any) => {
    e.preventDefault();
    setDragActiveRowId(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("error", "File is not an image type!");
      return;
    }

    setUploadingRowId(record.id);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        const res = await fetch("/api/admin/cover/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-password": "admin123"
          },
          body: JSON.stringify({ id: record.id, type: record._type, coverImage: base64String })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        updateLocalRow(record.id, data.record);
        showNotification("success", `Manual cover image dropped & saved for "${record.name}"!`);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to process dropped image.");
    } finally {
      setUploadingRowId(null);
    }
  };

  // 6. Bulk prompt generation
  const handleBulkPrompts = async () => {
    if (!window.confirm("This will scan all destinations and attractions, automatically generating prompts where coverPrompt is missing. No image generation costs will occur yet. Proceed in safe rate-limited batches?")) {
      return;
    }

    setBulkProcessing(true);
    try {
      const res = await fetch("/api/admin/cover/bulk-generate-prompts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-password": "admin123"
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bulk generation process aborted.");
      }

      showNotification("success", `Bulk prompt processing finished! Fully populated ${data.count} records without coverPrompts.`);
      fetchData(); // reload
    } catch (err: any) {
      showNotification("error", err.message || "Failed bulk prompt generation.");
    } finally {
      setBulkProcessing(false);
    }
  };

  // 6b. Bulk auto-fill Unsplash covers (Method 1)
  const handleBulkUnsplashFill = async () => {
    const actionUnit = unsplashOverwrite ? "ALL non-manual cover images" : "only MISSING cover images";
    if (!window.confirm(`Are you sure you want to automatically assign beautiful Unsplash covers to ${actionUnit} across your destinations and attractions? This will cover your portfolio instantly!`)) {
      return;
    }

    setUnsplashProcessing(true);
    try {
      const res = await fetch("/api/admin/cover/bulk-unsplash-autofill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "admin123"
        },
        body: JSON.stringify({ overwrite: unsplashOverwrite })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bulk Unsplash seeding failed");
      }

      showNotification("success", `Successfully applied Method 1. Auto-populated covers for ${data.destinationsUpdated} destinations and ${data.attractionsUpdated} attractions!`);
      fetchData(); // reload
    } catch (err: any) {
      showNotification("error", err.message || "Failed bulk Unsplash seeding.");
    } finally {
      setUnsplashProcessing(false);
    }
  };

  // Filtering calculation
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = typeFilter === "all" || item._type === typeFilter;
    
    const status = item.coverStatus || "pending";
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-700">
      {/* NOTIFICATIONS PANEL */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold transition-all transform flex items-center gap-2 ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          <span>{notification.type === "success" ? "✅" : "⚠️"}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* GEMINI CONFIG WARNING BANNER */}
      {configChecked && configStatus && !configStatus.configured && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 leading-relaxed">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl border border-rose-200 shrink-0 mt-1 md:mt-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-rose-900 tracking-tight">Gemini API Key Required</h3>
              <p className="text-xs text-rose-700 mt-1 max-w-2xl font-semibold">
                {configStatus.message} To resolve this:
              </p>
              <ul className="list-disc pl-5 text-xs text-rose-600 font-medium space-y-1 mt-2">
                <li>Click the <strong>Settings</strong> button (the gear icon ⚙️ in the top-right corner of the window).</li>
                <li>Go to the <strong>Secrets</strong> section.</li>
                <li>Add a new secret named <strong>GEMINI_API_KEY</strong> and paste your real API key (from Google AI Studio).</li>
                <li>Save and refresh the page to test prompting and generating any destination cover.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 leading-relaxed">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight">AI Cover Image Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-2 max-w-xl">
             India's Intelligent Mountain Travel Network cover art studio. Easily draft tourism visual descriptions, generate high-definition horizontal 16:9 covers, or drop manual graphics.
          </p>
        </div>

        {/* BULK ACTIONS BUTTON */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleBulkPrompts}
            disabled={bulkProcessing || loading}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs border border-purple-700"
          >
            {bulkProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Grid className="w-4 h-4" />
            )}
            {bulkProcessing ? "Batch Processing..." : "Generate Missing Prompts (Bulk)"}
          </button>
          <span className="text-[10px] text-slate-400 text-center font-bold">
            Scans missing coverPrompts safely in rate-limited batches
          </span>
        </div>
      </div>

      {/* METHOD 1 DASHBOARD CARD */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-36 h-36 bg-purple-200/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase rounded-full">
                Method 1 • Free &amp; Instant
              </span>
              <span className="text-xs text-slate-400 font-bold">|</span>
              <span className="text-xs text-indigo-700 font-extrabold">Seeding 941 Attractions &amp; 200 Destinations</span>
            </div>
            <h3 className="font-extrabold text-lg text-indigo-950 tracking-tight">Unsplash Intelligent Bulk Cover Autofill</h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Dynamically generates context-aware, keyword-optimized cover pictures matching each attraction's or destination's geographical context, name spelling, and segment taxonomy. Perfect for scaling covers across wide tourist inventories instantly with zero API costs.
            </p>
            
            {/* Options */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={unsplashOverwrite}
                  onChange={(e) => setUnsplashOverwrite(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-400 h-4 w-4 border-slate-300"
                />
                <span className="text-xs text-slate-700 font-bold">Overwrite existing auto-generated covers</span>
              </label>
              <div className="text-[11px] text-slate-500 font-medium">
                Currently loaded items: <strong className="text-indigo-900 font-bold">{items.length} records</strong>
              </div>
            </div>
          </div>

          <button
            onClick={handleBulkUnsplashFill}
            disabled={unsplashProcessing || loading}
            className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 transition cursor-pointer shadow-md shadow-indigo-200 border border-indigo-700 shrink-0 w-full lg:w-auto"
          >
            {unsplashProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            {unsplashProcessing ? "Applying Method 1..." : "Auto-Fill All Cover Images"}
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end leading-relaxed shadow-3xs">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Search Destinations & Attractions</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, category, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Entity Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">🗺️ All Portfolios</option>
            <option value="destinations">🏞️ Destinations Only</option>
            <option value="attractions">⭐ Attractions Only</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Cover Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">🔍 All Cover Statuses</option>
            <option value="pending">⏳ Pending AI Image</option>
            <option value="generated">✨ Generated via Gemini</option>
            <option value="manual">👤 Manually Overridden</option>
            <option value="failed">❌ Generation Failed</option>
          </select>
        </div>
      </div>

      {/* MASTER DATA TABLE VIEW */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-slate-400 font-semibold space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
            <p className="text-sm">Synchronizing travel portfolio metrics...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-semibold space-y-2 border-dashed border-2 border-slate-100 m-6 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm">No tourist records match the active search filter query criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 w-40">Portfolio Segment</th>
                  <th className="p-4 w-52">Primary Cover Showcase</th>
                  <th className="p-4 w-80">AI Description / Prompter</th>
                  <th className="p-4 w-28 text-center">Engine Status</th>
                  <th className="p-4 w-52 text-right">Aerosol Sandbox Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const status = item.coverStatus || "pending";
                  const isPending = status === "pending";
                  const isGenerated = status === "generated";
                  const isManual = status === "manual";
                  const isFailed = status === "failed";

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        dragActiveRowId === item.id ? "bg-purple-50/30" : ""
                      }`}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, item)}
                    >
                      {/* Name & Segment */}
                      <td className="p-4 align-top">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            item._type === "destinations" 
                              ? "bg-cyan-50 text-cyan-800 border border-cyan-100" 
                              : "bg-blue-50 text-blue-800 border border-blue-100"
                          }`}>
                            {item._type === "destinations" ? "🏞️ Destination" : "⭐ Attraction"}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{item.name}</h4>
                          <span className="block text-[10px] text-slate-400 font-medium">ID: {item.id}</span>
                          <span className="block text-[10px] text-purple-600 font-bold">
                            {item.tourismType || item.category || "Sightseeing"}
                          </span>
                        </div>
                      </td>

                      {/* Cover Photo Preview & Manual Input Dropzone */}
                      <td className="p-4 align-top">
                        <div className="space-y-2">
                          {item.coverImage ? (
                            <div className="relative group w-44 h-24 rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                              <img 
                                src={item.coverImage || undefined} 
                                alt={`${item.name} cover`} 
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-1 right-1 bg-black/60 rounded-md px-1.5 py-0.5 text-[8px] text-white font-extrabold uppercase tracking-wide">
                                {status}
                              </div>
                            </div>
                          ) : (
                            <div className="w-44 h-24 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-2 text-slate-400">
                              <ImageIcon className="w-5 h-5 text-slate-300 mb-1" />
                              <span className="text-[9px] font-extrabold tracking-tight">No Cover Set</span>
                            </div>
                          )}

                          {/* Quick File Select Dropzone area */}
                          <div className="w-44">
                            <input 
                              type="file" 
                              ref={el => { fileInputRefs.current[item.id] = el; }}
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, item)}
                            />
                            <button
                              onClick={() => triggerFileSelect(item.id)}
                              disabled={uploadingRowId === item.id}
                              className="w-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-[10px] font-extrabold text-slate-600 py-1 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition shadow-3xs"
                            >
                              {uploadingRowId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                              ) : (
                                <Upload className="w-3 h-3 text-slate-400" />
                              )}
                              Upload cover image
                            </button>
                            <p className="text-[8px] text-slate-400 text-center font-bold mt-1">
                              Or drop cover file here
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Interactive Prompt Textarea */}
                      <td className="p-4 align-top">
                        <div className="space-y-1.5 max-w-sm">
                          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Generated Image prompt</label>
                          <textarea
                            id={`prompt-text-${item.id}`}
                            defaultValue={item.coverPrompt || ""}
                            placeholder="Prompt not prepared. Fill in or click 'Regenerate Prompt' on the right."
                            className="w-full h-24 bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[10px] p-2 leading-relaxed rounded-lg focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-purple-400 resize-none"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                const ta = document.getElementById(`prompt-text-${item.id}`) as HTMLTextAreaElement;
                                if (ta) {
                                  handleSaveEditedPrompt(item, ta.value);
                                }
                              }}
                              disabled={savingPromptId === item.id}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[9px] text-slate-600 font-extrabold rounded-md flex items-center gap-1 cursor-pointer transition border border-slate-200"
                            >
                              {savingPromptId === item.id ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <Save className="w-2.5 h-2.5" />
                              )}
                              Save prompt
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Engine Status Pills */}
                      <td className="p-4 align-top text-center">
                        <div className="flex flex-col items-center justify-center gap-1 pt-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold leading-none ${
                            isPending ? "bg-amber-50 text-amber-800 border border-amber-100" :
                            isGenerated ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                            isManual ? "bg-blue-50 text-blue-800 border border-blue-100" :
                            "bg-rose-50 text-rose-800 border border-rose-100"
                          }`}>
                            {isPending && "⏳ Pending Image"}
                            {isGenerated && "✨ Generated"}
                            {isManual && "👤 Manual"}
                            {isFailed && "❌ Failed"}
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold block uppercase mt-1">
                            Status Pill
                          </span>
                        </div>
                      </td>

                      {/* Actions Box */}
                      <td className="p-4 align-top text-right">
                        <div className="flex flex-col gap-2 w-36 ml-auto pt-2">
                          <button
                            onClick={() => handleGenerateCover(item)}
                            disabled={generatingRowId === item.id || uploadingRowId === item.id}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 font-bold text-[10px] rounded-lg cursor-pointer transition flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {generatingRowId === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            {generatingRowId === item.id ? "Working..." : "Generate Cover"}
                          </button>

                          <button
                            onClick={() => handleRegeneratePrompt(item)}
                            disabled={regeneratingRowId === item.id || uploadingRowId === item.id}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-105 font-bold text-[10px] rounded-lg cursor-pointer transition flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {regeneratingRowId === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            {regeneratingRowId === item.id ? "Drafting..." : "Regenerate Prompt"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
