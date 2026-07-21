import React, { useState, useEffect } from 'react';
import { 
  Compass, ArrowRight, MapPin, Sparkles, Home, Calendar, Users, 
  Heart, Share2, Bookmark, MessageSquare, ArrowLeft, Search, 
  Clock, Eye, Globe, ChevronRight, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Blog, BlogCategory } from '../types';

interface TravelGuidesViewProps {
  currentPath: string;
  navigate: (path: string) => void;
}

// Visual theme matches HillyTrip's pristine ambient dark typography
export default function TravelGuidesView({ currentPath, navigate }: TravelGuidesViewProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Parse if we are on a specific article detail
  const isDetail = currentPath.startsWith('/travel-guides/') && currentPath !== '/travel-guides';
  const articleSlug = isDetail ? currentPath.replace('/travel-guides/', '') : '';

  useEffect(() => {
    fetchBlogsAndCategories();
  }, [isDetail, articleSlug]);

  async function fetchBlogsAndCategories() {
    setLoading(true);
    try {
      const blogsRes = await fetch('/api/blogs?status=Published');
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData);
      } else {
        throw new Error('Failed to load travel guides');
      }

      const catsRes = await fetch('/api/admin/data/blog_categories');
      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(catsData);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading travel guides.');
    } finally {
      setLoading(false);
    }
  }

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'all' || blog.categoryId === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Scanning Himalayan libraries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-slate-900/50 border border-red-500/20 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-slate-200 font-bold mb-2">Error Retrieving Library</p>
        <p className="text-slate-400 text-xs mb-4">{error}</p>
        <button 
          onClick={fetchBlogsAndCategories}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Mount detailed view or grid list view
  if (isDetail && articleSlug) {
    return <TravelGuideArticleView slug={articleSlug} navigate={navigate} allBlogs={blogs} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 📖 Page Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full mb-4">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase font-mono">SEO Content Engine</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4 font-sans">
          The HillyTrip <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Travel Guides</span>
        </h1>
        <p className="text-slate-450 text-sm md:text-base">
          Browse verified local insider itineraries, weather charts, and offbeat homestay insights generated directly from real-time database facts.
        </p>
      </div>

      {/* 🔍 Filter & Search Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides, trails, or destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Categories Carousel */}
        <div className="md:col-span-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 h-11 shrink-0 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-550 text-white shadow-lg shadow-sky-550/15'
                : 'bg-slate-900/40 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Guides
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 h-11 shrink-0 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-sky-550 text-white shadow-lg shadow-sky-550/15'
                  : 'bg-slate-900/40 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 🗂️ Grid List */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-850 rounded-3xl">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-300 font-bold mb-1">No matching guides found</p>
          <p className="text-slate-550 text-xs">Try searching for other terms or checking other categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog, idx) => {
            const hasImage = blog.featuredImage && blog.featuredImage !== "Featured Image Required";
            const catName = categories.find(c => c.id === blog.categoryId)?.name || "Travel Guide";
            return (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => navigate(`#/travel-guides/${blog.slug}`)}
                className="group relative bg-slate-900/30 hover:bg-slate-900/50 border border-slate-850 hover:border-slate-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden shrink-0">
                  {hasImage ? (
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-900 border-b border-slate-800">
                      <Globe className="w-8 h-8 text-slate-650 mb-2" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Featured Image Required</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-sky-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {catName}
                  </div>
                  <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{blog.readingTime} min read</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-sky-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-slate-450 text-xs line-clamp-3 mb-4 flex-grow">
                    {/* Strip Markdown tags for teaser */}
                    {blog.content.replace(/[#*`_\[\]()\-]/g, "").substring(0, 130).trim()}...
                  </p>
                  
                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-850/60 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sky-400 font-bold group-hover:translate-x-1 transition-transform">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Detailed view of a single Travel Guide
 */
interface ArticleDetail {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  categoryId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  featuredImage?: string;
  readingTime: number;
  tags?: string[];
  category?: { name: string; slug: string };
  author?: { name: string; avatarUrl: string; bio: string };
  seo?: { metaTitle: string; metaDescription: string; primaryKeyword: string; canonicalUrl: string };
  faqs?: { question: string; answer: string }[];
}

function TravelGuideArticleView({ slug, navigate, allBlogs }: { slug: string; navigate: (p: string) => void; allBlogs: Blog[] }) {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [views, setViews] = useState(0);

  useEffect(() => {
    fetchArticleDetails();
  }, [slug]);

  async function fetchArticleDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
        
        // Post view tracker
        fetch(`/api/blogs/${data.id}/view`, { method: 'POST' }).catch(() => {});
        setViews(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Likes
  const handleLike = async () => {
    if (!article || liked) return;
    setLiked(true);
    fetch(`/api/blogs/${article.id}/like`, { method: 'POST' }).catch(() => {});
  };

  // Handle Share Link
  const handleShare = async () => {
    if (!article) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
      fetch(`/api/blogs/${article.id}/share`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'copy_link' }) 
      }).catch(() => {});
    } catch (e) {
      console.warn("Clipboard access denied");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Opening travel logs...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
        <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-200 font-bold mb-2">Guide Not Found</p>
        <p className="text-slate-400 text-xs mb-4">The article you requested might have been moved or archived.</p>
        <button 
          onClick={() => navigate('#/travel-guides')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  // Related guides (based on category or other tags)
  const relatedGuides = allBlogs
    .filter(b => b.id !== article.id && b.categoryId === article.categoryId)
    .slice(0, 3);

  const hasImage = article.featuredImage && article.featuredImage !== "Featured Image Required";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* 🧭 Back Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('#/travel-guides')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Travel Guides</span>
        </button>

        {/* Breadcrumb Schema Rendering */}
        <nav className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
          <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('#/')}>Home</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('#/travel-guides')}>Travel Guides</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-slate-400 truncate max-w-[150px]">{article.title}</span>
        </nav>
      </div>

      {/* 🎨 Main Article Title Block */}
      <div className="mb-6">
        <span className="inline-block bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md mb-3">
          {article.category?.name || "Travel Guide"}
        </span>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
          {article.title}
        </h1>

        {/* Date & Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-slate-850/80 pb-5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Published: {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readingTime} min read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{views + (liked ? 1 : 0) * 4} views</span>
          </div>
        </div>
      </div>

      {/* 🖼️ Featured Image Header */}
      <div className="relative aspect-[21/9] w-full bg-slate-950 rounded-2xl overflow-hidden mb-8 border border-slate-850">
        {hasImage ? (
          <img 
            src={article.featuredImage} 
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900">
            <Globe className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black">Featured Image Required</span>
            <p className="text-[10px] text-slate-500 max-w-sm mt-1">HillyTrip's editorial regulations enforce that a manually vetted hero cover must be linked in the Admin panel before catalog display.</p>
          </div>
        )}
      </div>

      {/* 📚 Two-Column Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        {/* Sidebar: Author Details & Tools */}
        <div className="lg:col-span-1 space-y-6">
          {/* Author */}
          <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl text-center md:text-left">
            <img 
              src={article.author?.avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"} 
              alt={article.author?.name} 
              className="w-14 h-14 rounded-full mx-auto md:mx-0 object-cover border-2 border-sky-500/20 mb-3"
            />
            <h4 className="text-xs font-bold text-white mb-1">{article.author?.name || "HillyTrip Travel AI"}</h4>
            <p className="text-[10px] text-slate-450 leading-relaxed mb-3">{article.author?.bio}</p>
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-[9px] font-bold rounded-full font-mono">
              VERIFIED INSIDER
            </span>
          </div>

          {/* Interaction Utility Box */}
          <div className="flex flex-row lg:flex-col justify-around lg:justify-start gap-3 p-3 bg-slate-900/25 border border-slate-850/60 rounded-xl">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black transition-all w-full cursor-pointer border ${
                liked 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : 'bg-slate-900/40 border-slate-850 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-400' : ''}`} />
              <span>{liked ? 'Liked' : 'Like'}</span>
            </button>

            {/* Share */}
            <div className="relative w-full">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-900/40 border border-slate-850 text-slate-300 hover:text-white rounded-lg text-xs font-black transition-all w-full cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Link</span>
              </button>
              
              {/* Floating notification popover */}
              <AnimatePresence>
                {showShareToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute z-50 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 bottom-full lg:bottom-auto lg:top-full mt-2 w-44 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-sky-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>URL Copied to Clipboard!</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bookmark */}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black transition-all w-full cursor-pointer border ${
                bookmarked 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                  : 'bg-slate-900/40 border-slate-850 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 text-amber-400' : ''}`} />
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Article markdown body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-5">
            <MarkdownRenderer markdown={article.content} navigate={navigate} />
          </div>

          {/* Interactive FAQs Section */}
          {article.faqs && article.faqs.length > 0 && (
            <div className="mt-12 border-t border-slate-850 pt-8">
              <h3 className="text-lg font-extrabold text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3.5">
                {article.faqs.map((faq, fidx) => (
                  <FaqAccordionItem key={fidx} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔗 Related Guides Section */}
      {relatedGuides.length > 0 && (
        <div className="border-t border-slate-850 pt-8 mt-12">
          <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Related Travel Guides</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedGuides.map((rel) => (
              <div
                key={rel.id}
                onClick={() => {
                  setArticle(null); // Clear state to trigger loader
                  navigate(`#/travel-guides/${rel.slug}`);
                }}
                className="group cursor-pointer bg-slate-900/20 border border-slate-850 hover:border-slate-800 p-4 rounded-xl transition-all"
              >
                <div className="relative aspect-[16/10] bg-slate-950 rounded-lg overflow-hidden mb-3">
                  {rel.featuredImage && rel.featuredImage !== "Featured Image Required" ? (
                    <img 
                      src={rel.featuredImage} 
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 p-2 text-center text-[8px] font-mono text-slate-500 uppercase tracking-wider">
                      Featured Image Required
                    </div>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-2">
                  {rel.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * FAQ Accordion widget
 */
function FaqAccordionItem({ question, answer }: { question: string; answer: string; key?: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-900/40 border border-slate-850/60 rounded-xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-12 px-4 flex items-center justify-between text-left cursor-pointer transition hover:bg-slate-900/60"
      >
        <span className="text-xs font-bold text-slate-100">{question}</span>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${open ? 'rotate-90 text-sky-400' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 text-xs leading-relaxed text-slate-400 border-t border-slate-850/40 pt-2 bg-slate-950/20">
          {answer}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Clean & High-performance custom Markdown rendering component to parse headings, bullets, blocks and link routers
 */
function MarkdownRenderer({ markdown, navigate }: { markdown: string; navigate: (p: string) => void }) {
  // Simple paragraph & formatting block splitter
  const lines = markdown.split("\n");

  return (
    <div className="space-y-4">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-sm font-extrabold text-white tracking-wide mt-6 mb-2 uppercase font-mono">
              {trimmed.substring(4)}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-base font-black text-sky-400 tracking-tight mt-8 mb-3 border-b border-slate-850 pb-2">
              {trimmed.substring(3)}
            </h3>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-lg md:text-xl font-extrabold text-white mt-10 mb-4 tracking-tight">
              {trimmed.substring(2)}
            </h2>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex gap-2.5 items-start pl-2 text-slate-300">
              <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{parseInlineFormatting(trimmed.substring(2), navigate)}</span>
            </div>
          );
        }

        if (trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. ")) {
          const match = trimmed.match(/^(\d+\.)\s(.*)/);
          return (
            <div key={idx} className="flex gap-2.5 items-start pl-2 text-slate-300">
              <span className="text-sky-400 font-mono text-xs shrink-0">{match ? match[1] : "•"}</span>
              <span>{parseInlineFormatting(match ? match[2] : trimmed, navigate)}</span>
            </div>
          );
        }

        if (trimmed === "") {
          return <div key={idx} className="h-2"></div>;
        }

        return (
          <p key={idx} className="text-slate-300 leading-relaxed text-[13px] text-justify">
            {parseInlineFormatting(trimmed, navigate)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Regex parser mapping bold, italic, and routing Markdown links '[Title](/path)' to clean span & onClick action
 */
function parseInlineFormatting(text: string, navigate: (p: string) => void) {
  // Regex match for markdown links: [Label](Url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(...parseBoldItalic(textBefore));
    }

    const label = match[1];
    const url = match[2];

    parts.push(
      <span
        key={match.index}
        onClick={(e) => {
          e.preventDefault();
          // Routing mapping
          if (url.startsWith("/")) {
            navigate('#' + url);
          } else if (url.startsWith("#")) {
            navigate(url);
          } else {
            window.open(url, '_blank', 'noreferrer');
          }
        }}
        className="text-sky-400 font-black hover:underline cursor-pointer"
      >
        {label}
      </span>
    );

    lastIndex = linkRegex.lastIndex;
  }

  const textRemaining = text.substring(lastIndex);
  if (textRemaining) {
    parts.push(...parseBoldItalic(textRemaining));
  }

  return parts;
}

function parseBoldItalic(text: string) {
  // Simple splitter for bold **bold**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(textBefore);
    }
    parts.push(<strong key={match.index} className="text-white font-black">{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }

  const textRemaining = text.substring(lastIndex);
  if (textRemaining) {
    parts.push(textRemaining);
  }

  return parts;
}
