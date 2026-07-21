import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Clock, RefreshCw, Eye, CheckCircle2, AlertCircle, 
  Trash2, X, Compass, Check, BookOpen, Send, ShieldAlert, FileText 
} from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  category: string;
  readingTime: number;
  status: 'Draft' | 'Published';
  createdAt: string;
  publishedAt?: string;
  views: number;
  likes: number;
}

interface AdminTravelGuidesTabProps {
  adminEmail?: string;
}

export default function AdminTravelGuidesTab({ adminEmail }: AdminTravelGuidesTabProps = {}) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const activeAdminEmail = adminEmail || localStorage.getItem('hillytrip_admin_email') || 'admin@hillytrip.com';

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blogs?status=all'); // Admin gets all status values
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      } else {
        throw new Error("Failed to load guides.");
      }
    } catch (err: any) {
      showNotice('error', err.message || "Failed to contact database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleTriggerGeneration = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/admin/blogs/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-email': activeAdminEmail,
          'x-admin-password': 'admin123'
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice('success', `AI successfully generated draft: "${data.blog.title}"!`);
        fetchBlogs();
      } else {
        throw new Error(data.message || data.error || "AI generator encountered an error.");
      }
    } catch (err: any) {
      showNotice('error', err.message || "Manual generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (blogId: string, currentStatus: 'Draft' | 'Published') => {
    const nextStatus = currentStatus === 'Draft' ? 'Published' : 'Draft';
    try {
      setActionLoadingId(blogId);
      const res = await fetch('/api/admin/blogs/status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-email': activeAdminEmail,
          'x-admin-password': 'admin123'
        },
        body: JSON.stringify({ blogId, status: nextStatus }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice('success', `Guide successfully updated to ${nextStatus}!`);
        setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status: nextStatus, publishedAt: nextStatus === 'Published' ? new Date().toISOString() : undefined } : b));
        if (selectedBlog?.id === blogId) {
          setSelectedBlog(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      } else {
        throw new Error(data.message || data.error || "Failed to update guide status.");
      }
    } catch (err: any) {
      showNotice('error', err.message || "Status change failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this travel guide? This action is irreversible.")) return;
    try {
      setActionLoadingId(blogId);
      const res = await fetch(`/api/admin/data/blogs?id=${blogId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': activeAdminEmail,
          'x-admin-password': 'admin123'
        },
        credentials: 'include'
      });
      if (res.ok) {
        showNotice('success', "Travel guide permanently deleted.");
        setBlogs(prev => prev.filter(b => b.id !== blogId));
        if (selectedBlog?.id === blogId) {
          setSelectedBlog(null);
        }
      } else {
        throw new Error("Failed to delete record.");
      }
    } catch (err: any) {
      showNotice('error', err.message || "Deletion failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      {/* Header Info */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-850 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-sky-500/30">
              🟢 Autonomous Travel Guide Engine
            </span>
            <span className="text-slate-400 text-xs font-mono">
              SEO Content Engine V1.2
            </span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">HillyTrip Travel Guides CMS</h3>
          <p className="text-slate-400 text-xs max-w-xl">
            Autonomously write publish-ready local guide books, daily drafts, weather recommendations, and route alerts compiled directly from verified Supabase destination entries.
          </p>
        </div>
        <div className="flex gap-2 relative z-10">
          <button 
            onClick={fetchBlogs}
            disabled={loading}
            className="bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Guides</span>
          </button>
        </div>
      </div>

      {/* Trigger Area and Scheduling Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">AI Autonomous Writer</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Trigger Gemini to immediately analyze destinations, popular routes, and attractions, verify existing local reviews/prices, structure markdown headers, append styled layouts, and save a publish-ready draft guide.
            </p>
          </div>
          <button
            onClick={handleTriggerGeneration}
            disabled={generating || loading}
            className="w-full md:w-auto self-start px-6 py-3 bg-sky-500 hover:bg-sky-550 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/10 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Travel Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Autonomous Draft Generation</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Schedule Status</h4>
            </div>
            <div className="space-y-3 my-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-500">Autonomous Interval</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Every 24 Hours</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-500">Trigger Status</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Database Validation</span>
                <span className="text-sky-500 font-extrabold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Supabase Verified
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-150 dark:border-slate-850 text-[10px] text-slate-400 leading-relaxed">
            💡 Draft scheduler initializes daily at node container launch and triggers every 24 hours.
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-2.5 text-left text-xs ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-850 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60' 
            : 'bg-red-50 dark:bg-red-950/40 text-red-850 dark:text-red-400 border border-red-100 dark:border-red-900/60'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* List of articles */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left">
        <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
          <FileText className="w-5 h-5 text-sky-500" />
          <span>SEO Articles & Draft Registry</span>
        </h4>

        {loading ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mb-2" />
            <span className="text-xs text-slate-500">Retrieving articles from Supabase...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850">
            <Compass className="w-10 h-10 text-slate-350 dark:text-slate-600 mx-auto mb-2" />
            <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No guides generated yet</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Click the autonomous generator tool above to construct your very first high-fidelity draft guide based on Supabase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 font-mono text-slate-400 uppercase font-black tracking-widest text-[10px]">
                  <th className="pb-3 pr-4">Guide Detail</th>
                  <th className="pb-3 px-4">Slug</th>
                  <th className="pb-3 px-4">Metadata</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => {
                  const isPublishing = actionLoadingId === b.id;
                  const hasImg = b.featuredImage && b.featuredImage !== "Featured Image Required";
                  return (
                    <tr key={b.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                      <td className="py-3.5 pr-4 flex items-center gap-3 max-w-md">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-850 shrink-0">
                          {hasImg ? (
                            <img src={b.featuredImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400">
                              <Compass className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1">{b.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{b.category} • {b.readingTime} min read</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 truncate max-w-[150px]">{b.slug}</td>
                      <td className="py-3.5 px-4 text-slate-550 dark:text-slate-400">
                        <div>Views: <span className="font-mono font-bold">{b.views || 0}</span></div>
                        <div className="text-[10px] text-slate-400 font-mono">Likes: {b.likes || 0}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase ${
                          b.status === 'Published' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBlog(b)}
                            title="Preview Content"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleUpdateStatus(b.id, b.status)}
                            disabled={isPublishing}
                            className={`px-3 py-1.5 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1 ${
                              b.status === 'Published'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {isPublishing ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : b.status === 'Published' ? (
                              <span>Draft</span>
                            ) : (
                              <span>Publish</span>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            disabled={isPublishing}
                            title="Delete Permanently"
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-slate-400 hover:text-red-650 transition cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Preview Drawer/Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full flex flex-col shadow-2xl text-left border-l border-slate-200 dark:border-slate-800 animate-slide-left">
            {/* Header */}
            <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                  selectedBlog.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedBlog.status} PREVIEW
                </span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">{selectedBlog.title}</h4>
              </div>
              <button 
                onClick={() => setSelectedBlog(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable container */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6">
              {/* Cover Image */}
              {selectedBlog.featuredImage && selectedBlog.featuredImage !== "Featured Image Required" ? (
                <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                  <img src={selectedBlog.featuredImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-full aspect-[21/9] rounded-2xl flex flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-250 dark:border-slate-800 shrink-0">
                  <Compass className="w-8 h-8 text-slate-450 dark:text-slate-650 mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Featured Image Required</span>
                </div>
              )}

              {/* Metadata strip */}
              <div className="flex items-center gap-4 text-xs text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-4 font-mono">
                <div>Category: <strong className="text-slate-700 dark:text-slate-300 font-bold">{selectedBlog.category}</strong></div>
                <div>Reading Time: <strong className="text-slate-700 dark:text-slate-300 font-bold">{selectedBlog.readingTime} min</strong></div>
                <div>Created: <strong className="text-slate-700 dark:text-slate-300 font-bold">{new Date(selectedBlog.createdAt).toLocaleDateString()}</strong></div>
              </div>

              {/* Full Content */}
              <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedBlog.content}
              </div>
            </div>

            {/* Footer control panel */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center shrink-0">
              <button
                onClick={() => handleDeleteBlog(selectedBlog.id)}
                className="px-4 py-2 hover:bg-red-50 text-red-650 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-transparent hover:border-red-100 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Draft</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedBlog.id, selectedBlog.status)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md ${
                  selectedBlog.status === 'Published'
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{selectedBlog.status === 'Published' ? "Revert to Draft" : "Approve & Publish Live"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
