import React, { useState } from 'react';
import { MessageCircle, Send, Clock, Trash2, LogIn, MessageSquare } from 'lucide-react';

interface CommentType {
  id: string;
  userId: string;
  userName: string;
  contentId: string;
  contentType: 'destination' | 'attraction';
  text: string;
  timestamp: string;
}

interface CommentsSectionProps {
  contentId: string;
  contentType: 'destination' | 'attraction';
  comments: CommentType[];
  user: any; // Auth user
  onAddComment: (contentId: string, contentType: 'destination' | 'attraction', text: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onLogin: () => void;
}

export default function CommentsSection({
  contentId,
  contentType,
  comments = [],
  user,
  onAddComment,
  onDeleteComment,
  onLogin
}: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredComments = comments.filter(
    (c) => c.contentId === contentId && c.contentType === contentType
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(contentId, contentType, commentText);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div id={`comments-section-${contentType}-${contentId}`} className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 mt-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h4 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          Traveler Discussion ({filteredComments.length})
        </h4>
        <span className="text-xs text-slate-400 font-semibold font-mono uppercase tracking-wider">
          {contentType} reviews
        </span>
      </div>

      {/* Comment submission form */}
      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-250 flex items-center justify-center shrink-0 font-extrabold text-emerald-800 text-sm">
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                id="comment-input"
                rows={3}
                required
                maxLength={1000}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Share your experience or ask a question about this ${contentType}...`}
                className="w-full text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none rounded-xl p-3 resize-none transition-all"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  {commentText.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-5 py-2 BG-emerald-600 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200 text-center">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">🔐 Join the Discussion</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Please sign in to share your journey tips, ask questions, or connect with other regional travelers!
            </p>
            <button
              type="button"
              onClick={onLogin}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:scale-[1.02] cursor-pointer transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* Feed list of comments */}
      {filteredComments.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-50/40 rounded-2xl border border-dashed border-slate-150">
          <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium">No discussions yet. Be the first to start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              id={`comment-item-${comment.id}`}
              className="group flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/30 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-600 text-xs">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-bold text-slate-800">{comment.userName}</span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(comment.timestamp)}
                    </span>
                    {onDeleteComment && (user && (user.uid === comment.userId || user.email === 'amrkmurarka@gmail.com')) && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
