import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Layers, Image as ImageIcon,
  ShieldCheck, BarChart2, Globe, Link2, Sparkles, Check, X,
  Edit3, Trash2, ArrowUpRight, Folder, RefreshCw, Upload, Eye
} from 'lucide-react';
import { ContentItem, ContentType, ContentStatus, MediaItem, RedirectRule, ContentAnalytics } from '../../types/content';

interface ContentAdminCMSProps {
  initialSection?: 'destinations' | 'attractions' | 'routes';
}

export const ContentAdminCMS: React.FC<ContentAdminCMSProps> = ({ initialSection }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'seo_redirects' | 'analytics'>('content');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>(
    initialSection === 'destinations' ? 'destination' :
    initialSection === 'attractions' ? 'attraction' :
    initialSection === 'routes' ? 'route' : ''
  );
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialSection === 'destinations') setFilterType('destination');
    else if (initialSection === 'attractions') setFilterType('attraction');
    else if (initialSection === 'routes') setFilterType('route');
  }, [initialSection]);

  // Editor Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ContentItem> | null>(null);

  // Redirect Modal
  const [redirectModal, setRedirectModal] = useState(false);
  const [newRedirect, setNewRedirect] = useState({ sourceSlug: '', targetSlug: '', redirectType: 301 as 301 | 302 });

  useEffect(() => {
    loadAllData();
  }, [filterType, filterStatus, searchQuery]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterType) queryParams.append('contentType', filterType);
      if (filterStatus) queryParams.append('status', filterStatus);
      if (searchQuery) queryParams.append('search', searchQuery);

      const [itemsRes, mediaRes, redRes, analRes] = await Promise.all([
        fetch(`/api/content/items?${queryParams.toString()}`),
        fetch('/api/content/media'),
        fetch('/api/content/redirects'),
        fetch('/api/admin/content/analytics')
      ]);

      const [itemsData, mediaData, redData, analData] = await Promise.all([
        itemsRes.json(),
        mediaRes.json(),
        redRes.json(),
        analRes.json()
      ]);

      if (itemsData.success) setItems(itemsData.items);
      if (mediaData.success) setMediaList(mediaData.media);
      if (redData.success) setRedirects(redData.redirects);
      if (analData.success) setAnalytics(analData.analytics);
    } catch (e) {
      console.error('Error loading CMS data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem?.title || !editingItem?.slug) return;

    try {
      const res = await fetch('/api/content/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingItem(null);
        loadAllData();
      }
    } catch (e) {
      console.error('Error saving item:', e);
    }
  };

  const handleSaveRedirect = async () => {
    if (!newRedirect.sourceSlug || !newRedirect.targetSlug) return;
    try {
      const res = await fetch('/api/content/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRedirect, isActive: true })
      });
      const data = await res.json();
      if (data.success) {
        setRedirectModal(false);
        setNewRedirect({ sourceSlug: '', targetSlug: '', redirectType: 301 });
        loadAllData();
      }
    } catch (e) {
      console.error('Error saving redirect:', e);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Global Content Intelligence & CMS Platform
          </div>
          <h1 className="text-2xl font-black text-white">Content Command Center</h1>
          <p className="text-slate-400 text-xs">Manage destinations, attractions, homestays, media library, and SEO metadata across HillyTrip.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingItem({
                contentType: 'destination',
                title: '',
                slug: '',
                shortDescription: '',
                status: 'draft',
                priority: 5,
                tags: [],
                seo: { title: '', metaDescription: '', schemaType: 'TouristAttraction' }
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Create Content Item
          </button>
        </div>
      </div>

      {/* Analytics KPI Overview */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Managed Pages</span>
            <p className="text-2xl font-black text-white">{analytics.totalItems}</p>
            <p className="text-[11px] text-emerald-400 font-semibold">{analytics.publishedCount} Published / {analytics.draftCount} Drafts</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Average SEO Health Score</span>
            <p className="text-2xl font-black text-emerald-400">{analytics.averageSeoScore}/100</p>
            <p className="text-[11px] text-slate-400">Schema.org JSON-LD compliant</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Media Asset Library</span>
            <p className="text-2xl font-black text-white">{mediaList.length} Assets</p>
            <p className="text-[11px] text-slate-400">{(analytics.mediaTotalSizeBytes / (1024 * 1024)).toFixed(1)} MB total storage</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Active 301/302 Redirects</span>
            <p className="text-2xl font-black text-sky-400">{analytics.activeRedirectsCount}</p>
            <p className="text-[11px] text-slate-400">Zero broken slug links</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('content')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'content' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Content Repository ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'media' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Central Media Library ({mediaList.length})
        </button>
        <button
          onClick={() => setActiveTab('seo_redirects')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'seo_redirects' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          SEO Engine & Redirects ({redirects.length})
        </button>
      </div>

      {/* TAB 1: CONTENT REPOSITORY */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex-1">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search titles, tags, or slugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="">All Content Types</option>
                <option value="destination">Destination</option>
                <option value="attraction">Attraction</option>
                <option value="homestay">Homestay</option>
                <option value="blog">Blog / Travel Guide</option>
                <option value="faq">FAQ</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
              </select>
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Title & Type</th>
                  <th className="p-4">Slug & District</th>
                  <th className="p-4">SEO Health</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Version</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No content items found matching current filters.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 space-y-1">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {item.title}
                          {item.isFeatured && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] rounded font-bold uppercase">
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="inline-block px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-bold uppercase">
                          {item.contentType}
                        </span>
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="font-mono text-slate-300 font-bold truncate max-w-xs">/{item.slug}</div>
                        <div className="text-slate-500 text-[11px]">{item.district || 'Global'}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                            (item.seo.score || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {item.seo.score || 70}/100
                          </span>
                          <span className="text-[10px] text-slate-500">{item.seo.schemaType || 'General'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        v{item.version}.0
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MEDIA LIBRARY */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              Central Media Repository
            </h3>
            <span className="text-xs text-slate-400">{mediaList.length} media files stored</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((m) => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-3.5 space-y-3">
                <div className="h-40 rounded-xl overflow-hidden relative bg-slate-950">
                  <img src={m.url} alt={m.altText || m.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/90 text-white text-[10px] font-bold rounded uppercase">
                    {m.folder || 'general'}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs line-clamp-1">{m.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{m.caption || m.altText}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>{m.width}x{m.height} px</span>
                  <span>{((m.sizeBytes || 0) / 1024).toFixed(0)} KB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SEO & REDIRECTS */}
      {activeTab === 'seo_redirects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">URL Slug 301/302 Redirect Manager</h3>
              <p className="text-xs text-slate-400">Manage permanent and temporary redirects to prevent broken URL links across search engines.</p>
            </div>
            <button
              onClick={() => setRedirectModal(true)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Redirect
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Source Old Slug</th>
                  <th className="p-4">Target New Slug</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Total Hits</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {redirects.map((r) => (
                  <tr key={r.id}>
                    <td className="p-4 font-mono text-rose-300">/{r.sourceSlug}</td>
                    <td className="p-4 font-mono text-emerald-300">/{r.targetSlug}</td>
                    <td className="p-4 font-bold">{r.redirectType} Permanent</td>
                    <td className="p-4 font-bold text-white">{r.hitsCount} hits</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold uppercase">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT/CREATE ITEM MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-6 shadow-2xl text-white my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                {editingItem.id ? 'Edit Content Item' : 'Create New Content Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Content Type</label>
                  <select
                    value={editingItem.contentType}
                    onChange={(e) => setEditingItem({ ...editingItem, contentType: e.target.value as ContentType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="destination">Destination</option>
                    <option value="attraction">Attraction</option>
                    <option value="homestay">Homestay</option>
                    <option value="blog">Blog</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as ContentStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Kalimpong Eco Valley Tour"
                  value={editingItem.title || ''}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setEditingItem({ 
                      ...editingItem, 
                      title: newTitle,
                      slug: editingItem.slug ? editingItem.slug : autoSlug
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. kalimpong-eco-valley-tour"
                  value={editingItem.slug || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-indigo-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Short Summary Description</label>
                <textarea
                  rows={2}
                  placeholder="Provide a concise 2-sentence overview..."
                  value={editingItem.shortDescription || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, shortDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">District</label>
                  <input
                    type="text"
                    placeholder="e.g. Darjeeling / Kalimpong"
                    value={editingItem.district || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, district: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Featured Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={editingItem.featuredImage || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, featuredImage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Save Content Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE REDIRECT MODAL */}
      {redirectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-base font-bold">New URL Slug Redirect</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Old Source Slug</label>
                <input
                  type="text"
                  placeholder="e.g. old-darjeeling-page"
                  value={newRedirect.sourceSlug}
                  onChange={(e) => setNewRedirect({ ...newRedirect, sourceSlug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-rose-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">New Target Slug</label>
                <input
                  type="text"
                  placeholder="e.g. darjeeling"
                  value={newRedirect.targetSlug}
                  onChange={(e) => setNewRedirect({ ...newRedirect, targetSlug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-emerald-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setRedirectModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveRedirect} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                Create Redirect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
