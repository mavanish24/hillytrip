import React, { useState, useEffect } from 'react';
import { ModuleSearchInput } from './ModuleSearchInput';
import { 
  Compass, ArrowRight, MapPin, Sparkles, Home, Calendar, Users, 
  Heart, Share2, Bookmark, MessageSquare, ArrowLeft, Search, 
  Clock, Eye, Globe, ChevronLeft, ChevronRight, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Blog, BlogCategory, Destination } from '../types';
import { MarkdownRenderer, stripMarkdownToPlainText } from '../utils/markdownUtils';

interface TravelGuidesViewProps {
  currentPath: string;
  navigate: (path: string) => void;
}

// Visual theme matches HillyTrip's pristine ambient dark typography
export default function TravelGuidesView({ currentPath, navigate }: TravelGuidesViewProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const hash = window.location.hash || '';
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const params = new URLSearchParams(hash.substring(qIndex));
        return params.get('search') || params.get('q') || '';
      }
    } catch (e) {}
    return '';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncQueryFromUrl = () => {
      try {
        const hash = window.location.hash || '';
        const qIndex = hash.indexOf('?');
        if (qIndex !== -1) {
          const params = new URLSearchParams(hash.substring(qIndex));
          const q = params.get('search') || params.get('q') || '';
          if (q) setSearchQuery(q);
        }
      } catch (e) {}
    };
    syncQueryFromUrl();
    window.addEventListener('hashchange', syncQueryFromUrl);
    return () => window.removeEventListener('hashchange', syncQueryFromUrl);
  }, []);

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
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          (blog.title && blog.title.toLowerCase().includes(q)) || 
                          (blog.content && blog.content.toLowerCase().includes(q)) ||
                          (blog.category && blog.category.toLowerCase().includes(q)) ||
                          (Array.isArray(blog.tags) && blog.tags.some((t: string) => t.toLowerCase().includes(q)));
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
        <p className="text-slate-450 text-sm md:text-base mb-6">
          Browse verified local insider itineraries, weather charts, and offbeat homestay insights generated directly from real-time database facts.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('#/routes')}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer font-mono"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>Explore / Start Travel Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🔍 Filter & Search Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <div className="relative md:col-span-1">
          <ModuleSearchInput
            scope="blogs"
            placeholder="Search Blogs..."
            value={searchQuery}
            onChange={setSearchQuery}
            navigate={navigate}
            blogs={blogs}
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
                    {stripMarkdownToPlainText(blog.content).substring(0, 130).trim()}...
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
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const destsScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArticleDetails();
    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllDestinations(data);
      })
      .catch(() => {});
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

  // Related destinations (dynamically computed based on article context or location)
  const relatedDestinations = React.useMemo(() => {
    if (!article || allDestinations.length === 0) return [];

    const articleText = `${article.title || ''} ${article.content || ''} ${article.tags ? article.tags.join(' ') : ''}`.toLowerCase();
    
    // Check if article has direct destination match
    const destId = (article as any).destinationId;
    const currentDest = destId ? allDestinations.find(d => d.id === destId || d.slug === destId) : null;

    let matches: Destination[] = [];

    if (currentDest) {
      matches = allDestinations.filter(d => 
        d.id !== currentDest.id && 
        (d.district === currentDest.district || d.state === currentDest.state)
      );
    } else {
      // Find destinations whose name/slug is mentioned in title/tags/content
      matches = allDestinations.filter(d => {
        const nameLower = d.name.toLowerCase();
        const slugLower = (d.slug || d.id).toLowerCase();
        return articleText.includes(nameLower) || articleText.includes(slugLower);
      });
    }

    const usedIds = new Set(matches.map(m => m.id));
    if (currentDest) usedIds.add(currentDest.id);

    const fallbacks = allDestinations.filter(d => !usedIds.has(d.id));

    return [...matches, ...fallbacks].slice(0, 4);
  }, [article, allDestinations]);

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

  // Determine location if available
  const knownLocations = ["Darjeeling", "Sikkim", "Gangtok", "Kalimpong", "Chatakpur", "Sittong", "Zuluk", "Rinchenpong", "Pelling", "Lachen", "Lachung", "Ravangla", "Namchi", "Mirik", "Kurseong", "Siliguri", "NJP"];
  
  let locationName: string | null = (article as any).location || (article as any).destinationName || null;
  if (!locationName && article.tags && article.tags.length > 0) {
    const locTag = article.tags.find(t => knownLocations.some(kl => t.toLowerCase().includes(kl.toLowerCase())));
    if (locTag) locationName = locTag;
  }
  if (!locationName) {
    const matchedLoc = knownLocations.find(kl => article.title.toLowerCase().includes(kl.toLowerCase()) || article.content.toLowerCase().includes(kl.toLowerCase()));
    if (matchedLoc) locationName = `${matchedLoc}, Himalayas`;
  }

  // Format updated date nicely (e.g. Jul 31, 2026)
  const rawDate = article.updatedAt || (article as any).publishedAt || article.createdAt;
  const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;

  // Determine Category name - if empty or missing, don't show blank
  const categoryName = article.category?.name || (typeof (article as any).category === 'string' && (article as any).category ? (article as any).category : null);

  // Author details
  const authorName = article.author?.name || null;

  // JSON-LD Structured Data
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://hillytrip.com/travel-guides/${article.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": hasImage ? [article.featuredImage] : undefined,
    "datePublished": article.createdAt,
    "dateModified": rawDate || article.createdAt,
    "author": authorName ? [{ "@type": "Person", "name": authorName }] : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "HillyTrip",
      "url": "https://hillytrip.com"
    },
    "description": article.seo?.metaDescription || (article as any).excerpt || article.title
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hillytrip.com/" },
      { "@type": "ListItem", "position": 2, "name": "Travel Guides", "item": "https://hillytrip.com/#/travel-guides" },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": currentUrl }
    ]
  };

  const faqJsonLd = article.faqs && article.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* 🔍 SEO JSON-LD Structured Data Scripts */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
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
        {categoryName && (
          <span className="inline-block bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md mb-3">
            {categoryName}
          </span>
        )}
        <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
          {article.title}
        </h1>

        {/* Improved Date & Meta Info Header */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400 border-b border-slate-850/80 pb-5">
          {locationName && (
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{locationName}</span>
            </div>
          )}

          {authorName && (
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>By {authorName}</span>
            </div>
          )}

          {formattedDate && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Updated {formattedDate}</span>
            </div>
          )}

          {article.readingTime ? (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{article.readingTime} min read</span>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5 text-slate-400">
            <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
          {/* Author - Hide completely if no author name */}
          {authorName && (
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl text-center md:text-left">
              <img 
                src={article.author?.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=HillyTripGuide"} 
                alt={authorName} 
                className="w-14 h-14 rounded-full mx-auto md:mx-0 object-cover border-2 border-sky-500/20 mb-3"
              />
              <h4 className="text-xs font-bold text-white mb-1">{authorName}</h4>
              {article.author?.bio && (
                <p className="text-[10px] text-slate-450 leading-relaxed mb-3">{article.author.bio}</p>
              )}
              <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-[9px] font-bold rounded-full font-mono">
                VERIFIED INSIDER
              </span>
            </div>
          )}

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

      {/* 🗺️ Related Destinations Section (Horizontal Scrolling Carousel) */}
      {relatedDestinations.length > 0 && (
        <div className="border-t border-slate-850 pt-8 mt-12">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>Related Destinations</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Explore nearby hill stations and scenic getaways
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Horizontal Scroll Navigation Controls */}
              <div className="flex items-center gap-1.5 mr-1">
                <button
                  onClick={() => destsScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                  aria-label="Scroll left"
                  className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => destsScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                  aria-label="Scroll right"
                  className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => navigate('#/destinations')}
                className="hidden sm:flex text-xs font-bold text-sky-400 hover:text-sky-300 items-center gap-1 transition cursor-pointer shrink-0 ml-1"
              >
                <span>Explore All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Container */}
          <div 
            ref={destsScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          >
            {relatedDestinations.map((dest) => {
              const destSlug = dest.slug || dest.id;
              const imgUrl = dest.coverImage || dest.image || "https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png";

              return (
                <div
                  key={dest.id}
                  onClick={() => navigate(`#/destinations/${destSlug}`)}
                  className="snap-start shrink-0 w-[260px] sm:w-[280px] group cursor-pointer bg-slate-900/30 border border-slate-850 hover:border-emerald-500/30 hover:bg-slate-900/70 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={dest.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      {dest.district && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-slate-300 border border-slate-750 text-[10px] font-medium rounded-md">
                          {dest.district}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
                        {dest.name}
                      </h4>
                      {dest.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {stripMarkdownToPlainText(dest.description)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-850/50 flex items-center justify-between text-[11px] text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Explore Destination</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
