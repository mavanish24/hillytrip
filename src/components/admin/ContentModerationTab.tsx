import React, { useState } from 'react';
import { 
  ShieldAlert, CheckCircle2, EyeOff, AlertOctagon, 
  Trash2, MessageSquare, Image, FileText, RefreshCw 
} from 'lucide-react';
import { ModerationQueueItem } from '../../types/admin';

interface ContentModerationTabProps {
  queue: ModerationQueueItem[];
  onModerateItem: (itemId: string, status: ModerationQueueItem['status']) => void;
  onRefresh: () => void;
}

export const ContentModerationTab: React.FC<ContentModerationTabProps> = ({
  queue,
  onModerateItem,
  onRefresh
}) => {
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');

  const filteredQueue = queue.filter(item => {
    if (targetTypeFilter !== 'all' && item.targetType !== targetTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Platform Content Moderation & Safety Desk
          </h2>
          <p className="text-xs text-slate-400">Review flagged user reviews, traveler moments, photos and comments to enforce community guidelines.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Target Types</option>
            <option value="review">Reviews</option>
            <option value="comment">Comments</option>
            <option value="traveler_moment">Traveler Moments</option>
            <option value="photo">Photos</option>
            <option value="blog">Blogs</option>
          </select>

          <button 
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Moderation Queue Items */}
      <div className="space-y-4">
        {filteredQueue.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 text-xs">
            No pending moderation items in queue. All community posts are clear!
          </div>
        ) : (
          filteredQueue.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.targetType.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-white">Author: {item.authorName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Flag: {item.flagReason.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Reports: {item.reportedCount}
                  </span>
                </div>
              </div>

              {/* Content Snippet */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-200 italic">
                "{item.contentSnippet}"
              </div>

              {/* Moderation Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-500">
                  Submitted on {new Date(item.createdAt).toLocaleDateString()} • Current Status: <strong className="text-slate-300 uppercase">{item.status}</strong>
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onModerateItem(item.id, 'approved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Keep Public
                  </button>

                  <button
                    onClick={() => onModerateItem(item.id, 'hidden')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Hide / Remove Content
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
