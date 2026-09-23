import React from 'react';
import { 
  Building2, Home, Car, Star, Image as ImageIcon, ShoppingBag, 
  Mail, ArrowRight, CheckCircle2, Clock, ShieldAlert, User, FileText, ChevronRight
} from 'lucide-react';
import { BusinessClaimRequest, ManagedBusiness, ModerationQueueItem } from '../../types/admin';

export interface RecentBooking {
  id: string;
  customerName: string;
  serviceName: string;
  serviceType: 'homestay' | 'taxi' | 'tour';
  amountInr: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  date: string;
}

export interface RecentPhoto {
  id: string;
  title: string;
  uploaderName: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  thumbnailUrl: string;
}

export interface RecentContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  messageSnippet: string;
  isUnread: boolean;
  receivedAt: string;
}

interface AdminOverviewTabProps {
  claims: BusinessClaimRequest[];
  businesses: ManagedBusiness[];
  moderationQueue: ModerationQueueItem[];
  bookings?: RecentBooking[];
  photos?: RecentPhoto[];
  contactMessages?: RecentContactMessage[];
  onNavigateTab: (tab: string, subtab?: string) => void;
  onRefresh: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  claims = [],
  businesses = [],
  moderationQueue = [],
  bookings = [],
  photos = [],
  contactMessages = [],
  onNavigateTab,
  onRefresh
}) => {
  // Calculated stats for solo founder
  const pendingClaimsCount = claims.filter(c => c.status === 'pending').length;
  const pendingHomestaysCount = businesses.filter(b => b.type === 'homestay' && b.status === 'pending').length;
  const pendingTaxiCount = businesses.filter(b => b.type === 'taxi_operator' && b.status === 'pending').length;
  const pendingReviewsCount = moderationQueue.filter(m => m.targetType === 'review' && m.status === 'pending').length;
  const pendingPhotosCount = photos.filter(p => p.status === 'pending').length || moderationQueue.filter(m => m.targetType === 'photo' && m.status === 'pending').length;
  const todaysBookingsCount = bookings.filter(b => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return b.date.startsWith(todayStr) || b.status === 'pending' || b.status === 'confirmed';
  }).length || bookings.length;
  const unreadMessagesCount = contactMessages.filter(m => m.isUnread).length;

  // Real database records slice
  const recentClaims = claims.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);
  const recentReviews = moderationQueue.filter(m => m.targetType === 'review').slice(0, 5);
  const recentPhotos = photos.slice(0, 5);
  const recentMessages = contactMessages.slice(0, 5);

  const statCards = [
    {
      title: 'Pending Claims',
      count: pendingClaimsCount,
      icon: Building2,
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      tab: 'moderation',
      subtab: 'claims'
    },
    {
      title: 'Pending Homestays',
      count: pendingHomestaysCount,
      icon: Home,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      tab: 'businesses',
      subtab: 'homestays'
    },
    {
      title: 'Pending Taxis',
      count: pendingTaxiCount,
      icon: Car,
      color: 'indigo',
      bgColor: 'bg-indigo-500/10',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20',
      tab: 'businesses',
      subtab: 'taxis'
    },
    {
      title: 'Pending Reviews',
      count: pendingReviewsCount,
      icon: Star,
      color: 'rose',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20',
      tab: 'moderation',
      subtab: 'reviews'
    },
    {
      title: 'Pending Photos',
      count: pendingPhotosCount,
      icon: ImageIcon,
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      tab: 'moderation',
      subtab: 'photos'
    },
    {
      title: "Today's Bookings",
      count: todaysBookingsCount,
      icon: ShoppingBag,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      tab: 'bookings'
    },
    {
      title: 'Unread Messages',
      count: unreadMessagesCount,
      icon: Mail,
      color: 'cyan',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
      tab: 'notifications'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Seven Minimal Action Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Action Required Overview</h2>
          <span className="text-xs text-slate-500 font-mono">Solo Founder Operations Mode</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigateTab(card.tab, card.subtab)}
                className={`p-4 rounded-xl bg-slate-900 border ${card.borderColor} hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between cursor-pointer group shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                    {card.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.textColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">{card.count}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Five Clean Recent Content Tables */}
      <div className="space-y-6">

        {/* Recent Claims & Recent Bookings (Grid of 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Claims */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Recent Claims
              </h3>
              <button 
                onClick={() => onNavigateTab('moderation', 'claims')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-800/80">
              {recentClaims.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No pending claims found.</div>
              ) : (
                recentClaims.map(claim => (
                  <div key={claim.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{claim.businessName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Claimant: <span className="text-slate-300">{claim.claimantName}</span> ({claim.documentType})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                Recent Bookings
              </h3>
              <button 
                onClick={() => onNavigateTab('bookings')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-800/80">
              {recentBookings.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No bookings found.</div>
              ) : (
                recentBookings.map(bk => (
                  <div key={bk.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{bk.serviceName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Customer: <span className="text-slate-300">{bk.customerName}</span> • {bk.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">₹{bk.amountInr.toLocaleString()}</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {bk.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Reviews & Recent Photos (Grid of 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reviews */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-rose-400" />
                Recent Reviews
              </h3>
              <button 
                onClick={() => onNavigateTab('moderation', 'reviews')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-800/80">
              {recentReviews.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No reviews found.</div>
              ) : (
                recentReviews.map(rev => (
                  <div key={rev.id} className="py-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{rev.authorName}</span>
                      <span className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 italic">"{rev.contentSnippet}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Photos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Recent Photos
              </h3>
              <button 
                onClick={() => onNavigateTab('moderation', 'photos')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-800/80">
              {recentPhotos.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No photos found.</div>
              ) : (
                recentPhotos.map(pht => (
                  <div key={pht.id} className="py-2.5 flex items-center gap-3 text-xs">
                    <img src={pht.thumbnailUrl} alt={pht.title} className="w-10 h-10 rounded-lg object-cover border border-slate-800" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-200">{pht.title}</div>
                      <div className="text-[11px] text-slate-400">{pht.location} • By {pht.uploaderName}</div>
                    </div>
                    <span className="text-[10px] text-slate-500">{pht.submittedAt}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Contact Messages (Full Width) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              Recent Contact Messages
            </h3>
            <button 
              onClick={() => onNavigateTab('notifications')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-800/80">
            {recentMessages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No contact messages found.</div>
            ) : (
              recentMessages.map(msg => (
                <div key={msg.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{msg.senderName}</span>
                      <span className="text-[11px] text-slate-400">&lt;{msg.senderEmail}&gt;</span>
                      {msg.isUnread && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">NEW</span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-300">{msg.subject}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{msg.messageSnippet}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap">{msg.receivedAt}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
