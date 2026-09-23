import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Star, Power, Trash2, Eye, MousePointer, Bookmark, Share2, Tag, Percent, BarChart2, ShieldCheck, Flame, RefreshCw, Plus, Edit2, Calendar, X, Sparkles
} from 'lucide-react';
import { Offer, OfferBadgeType, BusinessCategoryType } from '../../types/offer';
import { 
  getAllOffersRaw, approveOffer, rejectOffer, toggleFeatureOffer, toggleActiveOffer, deleteOffer, subscribeOffers, createOffer, updateOffer 
} from '../../services/offers/OfferEngine';
import { OfferBadge } from './OfferBadge';

const BADGES: OfferBadgeType[] = [
  '20% OFF',
  '15% OFF',
  'Flat ₹500 OFF',
  'Flat ₹1000 OFF',
  'Free Breakfast',
  'Kids Stay Free',
  'Early Bird',
  'Weekend Special',
  'Limited Time',
  'Seasonal Offer'
];

const CATEGORIES: BusinessCategoryType[] = [
  'Homestay',
  'Hotel',
  'Taxi Operator',
  'Tour Operator',
  'Restaurant',
  'Activity',
  'Local Experience'
];

export const AdminOffersManagerTab: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create / Edit Platform Offer Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BusinessCategoryType>('Homestay');
  const [badge, setBadge] = useState<OfferBadgeType>('20% OFF');
  const [businessName, setBusinessName] = useState('HillyTrip Official');
  const [businessVerified, setBusinessVerified] = useState(true);
  const [destinationName, setDestinationName] = useState('Darjeeling');
  const [couponCode, setCouponCode] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [ctaText, setCtaText] = useState('View Offer');
  const [fullDescription, setFullDescription] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]); // Start Date
  const [validTill, setValidTill] = useState(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]); // End Date
  const [discountType, setDiscountType] = useState<'percent' | 'flat' | 'none'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [termsInput, setTermsInput] = useState('Valid for direct bookings via HillyTrip.\nCannot be combined with other promotional offers.');
  const [businessPhone, setBusinessPhone] = useState('+91 98320 12345');
  const [businessWhatsApp, setBusinessWhatsApp] = useState('+91 98320 12345');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  useEffect(() => {
    const loadOffers = () => {
      setOffers(getAllOffersRaw());
    };
    loadOffers();
    const unsub = subscribeOffers(loadOffers);
    return () => unsub();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingOfferId(null);
    setTitle('');
    setCategory('Homestay');
    setBadge('20% OFF');
    setBusinessName('HillyTrip Official');
    setBusinessVerified(true);
    setDestinationName('Darjeeling');
    setCouponCode(`PLATFORM${Math.floor(Math.random() * 900 + 100)}`);
    setCoverImage('');
    setCtaText('View Offer');
    setFullDescription('');
    setValidFrom(new Date().toISOString().split('T')[0]);
    setValidTill(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);
    setDiscountType('percent');
    setDiscountValue(20);
    setTermsInput('Valid for direct bookings via HillyTrip.\nCannot be combined with other promotional offers.');
    setBusinessPhone('+91 98320 12345');
    setBusinessWhatsApp('+91 98320 12345');
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (off: Offer) => {
    setEditingOfferId(off.id);
    setTitle(off.title);
    setCategory(off.category);
    setBadge(off.badge as OfferBadgeType);
    setBusinessName(off.businessName);
    setBusinessVerified(off.businessVerified);
    setDestinationName(off.destinationName);
    setCouponCode(off.couponCode || '');
    setCoverImage(off.coverImage || '');
    setCtaText(off.ctaText || 'View Offer');
    setFullDescription(off.fullDescription);
    setValidFrom(off.validFrom);
    setValidTill(off.validTill);
    if (off.discountPercentage) {
      setDiscountType('percent');
      setDiscountValue(off.discountPercentage);
    } else if (off.flatDiscountAmount) {
      setDiscountType('flat');
      setDiscountValue(off.flatDiscountAmount);
    } else {
      setDiscountType('none');
      setDiscountValue(0);
    }
    setTermsInput((off.termsAndConditions || []).join('\n'));
    setBusinessPhone(off.businessPhone || '');
    setBusinessWhatsApp(off.businessWhatsApp || '');
    setIsFeatured(!!off.isFeatured);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fullDescription.trim()) return;

    const termsArr = termsInput.split('\n').filter((t) => t.trim().length > 0);

    const payload: Partial<Offer> = {
      title,
      badge,
      category,
      businessId: 'biz-platform-admin',
      businessName: businessName || 'HillyTrip Official',
      businessVerified,
      destinationName,
      destinationId: `dest-${destinationName.toLowerCase().replace(/\s+/g, '-')}`,
      coverImage: coverImage.trim() ? coverImage.trim() : null,
      ctaText: ctaText.trim() ? ctaText.trim() : 'View Offer',
      fullDescription,
      couponCode: couponCode.trim().toUpperCase() || 'HILLYTRIP20',
      validFrom, // Start Date
      validTill, // End Date
      termsAndConditions: termsArr,
      businessPhone,
      businessWhatsApp,
      discountPercentage: discountType === 'percent' ? Number(discountValue) : undefined,
      flatDiscountAmount: discountType === 'flat' ? Number(discountValue) : undefined,
      status: 'approved',
      isActive: true,
      isFeatured
    };

    if (editingOfferId) {
      updateOffer(editingOfferId, payload);
    } else {
      createOffer(payload);
    }

    setIsModalOpen(false);
  };

  // Compute Overall Analytics
  const totalOffers = offers.length;
  const activeOffers = offers.filter(o => o.isActive && o.status === 'approved').length;
  const totalViews = offers.reduce((acc, o) => acc + (o.analytics?.views || 0), 0);
  const totalClicks = offers.reduce((acc, o) => acc + (o.analytics?.clicks || 0), 0);
  const totalClaims = offers.reduce((acc, o) => acc + (o.analytics?.claims || 0), 0);
  const overallCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

  const filteredOffers = offers.filter(o => {
    if (filterStatus === 'approved' && o.status !== 'approved') return false;
    if (filterStatus === 'pending' && o.status !== 'pending') return false;
    if (filterStatus === 'rejected' && o.status !== 'rejected') return false;
    if (filterStatus === 'featured' && !o.isFeatured) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.businessName.toLowerCase().includes(q) ||
        o.destinationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header & Analytics Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🎁 Offers & Vouchers Control Center</span>
          </h2>
          <p className="text-xs text-slate-400">
            Platform-wide governance, verification, feature promotion, and conversion analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hidden sm:inline-block">
            {activeOffers} Active Offers Live
          </span>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Platform Offer</span>
          </button>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Deals</span>
          <div className="text-xl font-black text-white">{totalOffers}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Impressions</span>
          </span>
          <div className="text-xl font-black text-sky-400">{totalViews.toLocaleString()}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Engagements</span>
          </span>
          <div className="text-xl font-black text-emerald-400">{totalClicks.toLocaleString()}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Coupon Claims</span>
          </span>
          <div className="text-xl font-black text-amber-400">{totalClaims.toLocaleString()}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Platform CTR</span>
          </span>
          <div className="text-xl font-black text-purple-400">{overallCTR}%</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'approved', 'featured', 'pending', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by title, business, or destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Admin Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5">Offer Deal & Business</th>
                <th className="p-3.5">Category & Location</th>
                <th className="p-3.5">Validity Period</th>
                <th className="p-3.5">Status & Feature</th>
                <th className="p-3.5">Analytics (V/C/S/Claim)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOffers.map((off) => {
                const ctr = (off.analytics?.views || 0) > 0 
                  ? (((off.analytics?.clicks || 0) / off.analytics.views) * 100).toFixed(1)
                  : '0';

                return (
                  <tr key={off.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3 max-w-xs">
                        {off.coverImage ? (
                          <img
                            src={off.coverImage}
                            alt=""
                            className="w-12 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950 border border-slate-800 shrink-0 flex items-center justify-center text-xs font-bold text-amber-300 shadow-inner">
                            🎁
                          </div>
                        )}
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <OfferBadge badge={off.badge} size="sm" />
                            {off.isFeatured && (
                              <span className="p-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="font-extrabold text-white truncate">{off.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{off.businessName}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-300">
                      <div className="font-bold">{off.category}</div>
                      <div className="text-[11px] text-emerald-400">{off.destinationName}</div>
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      <div>Start: {off.validFrom}</div>
                      <div>End: {off.validTill}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          off.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                          off.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        }`}>
                          {off.status}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          State: {off.isActive ? 'Active' : 'Paused'}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-slate-300">👁 {off.analytics?.views || 0} views</div>
                      <div className="text-emerald-400">🖱 {off.analytics?.clicks || 0} clicks ({ctr}%)</div>
                      <div className="text-amber-400">🏷 {off.analytics?.claims || 0} claims</div>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(off)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                          title="Edit Offer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {off.status !== 'approved' && (
                          <button
                            onClick={() => approveOffer(off.id)}
                            className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 transition-colors cursor-pointer"
                            title="Approve Offer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {off.status !== 'rejected' && (
                          <button
                            onClick={() => rejectOffer(off.id)}
                            className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 transition-colors cursor-pointer"
                            title="Reject Offer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => toggleFeatureOffer(off.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            off.isFeatured 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`w-3.5 h-3.5 ${off.isFeatured ? 'fill-amber-400' : ''}`} />
                        </button>

                        <button
                          onClick={() => toggleActiveOffer(off.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            off.isActive 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                          title="Toggle Active/Pause"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('Delete this offer from platform database?')) {
                              deleteOffer(off.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PLATFORM OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingOfferId ? 'Edit Platform Offer' : 'Create Platform Offer'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Publish official HillyTrip deals, partner discount vouchers, and seasonal offers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleSaveForm} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Offer Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn Tea Garden Harvest Special - 20% OFF"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BusinessCategoryType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Badge / Offer Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Offer Badge / Tag *</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as OfferBadgeType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {BADGES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Business / Partner Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Partner / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HillyTrip Official, Glenburn Tea Estate"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Destination *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Darjeeling, Gangtok, Pelling, Kalimpong"
                    value={destinationName}
                    onChange={(e) => setDestinationName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Coupon Code */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HILLY20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-amber-300 uppercase font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Banner Cover Image URL (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">Banner Cover Image URL (Optional)</label>
                    <span className="text-[10px] text-emerald-400 font-bold">Text-only if blank</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://... (Leave blank for Text-Only offer)"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Call To Action Text (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">CTA Button Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. View Offer, Claim 20% OFF, Book Deal"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Start Date Date-Picker Component */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Start Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer [color-scheme:dark]"
                  />
                </div>

                {/* End Date Date-Picker Component */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>End Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer [color-scheme:dark]"
                  />
                </div>

                {/* Discount Configuration */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="percent">Percentage Discount (%)</option>
                    <option value="flat">Flat Amount Discount (₹)</option>
                    <option value="none">Special Perk / Free Inclusions</option>
                  </select>
                </div>

                {discountType !== 'none' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Discount Value ({discountType === 'percent' ? '%' : '₹'})
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Full Offer Description */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Full Offer Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the details, package benefits, inclusions, and redemption instructions..."
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Terms & Conditions */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Terms & Conditions (One per line)</label>
                  <textarea
                    rows={2}
                    value={termsInput}
                    onChange={(e) => setTermsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Contact Options */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Contact Phone</label>
                  <input
                    type="text"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">WhatsApp Number</label>
                  <input
                    type="text"
                    value={businessWhatsApp}
                    onChange={(e) => setBusinessWhatsApp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Checkbox: Feature on Homepage */}
                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-300">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-950 cursor-pointer"
                    />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Feature prominently on HillyTrip Homepage & Deals Spotlight</span>
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  {editingOfferId ? 'Update Platform Offer' : 'Create & Publish Platform Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

