import React, { useState } from 'react';

interface TravelerReviewsSectionProps {
  destinationId: string;
  destinationName: string;
  reviews: any[];
  user: any;
  isAdmin: boolean;
  onAddReview: (destinationId: string, rating: number, title: string, content: string, visitDate: string, recommends: boolean) => void;
  onDeleteReview: (reviewId: string) => void;
  onLogin: () => void;
}

export const TravelerReviewsSection: React.FC<TravelerReviewsSectionProps> = ({
  destinationId,
  destinationName,
  reviews,
  user,
  isAdmin,
  onAddReview,
  onDeleteReview,
  onLogin,
}) => {
  const [formRating, setFormRating] = useState(5);
  const [formRecommends, setFormRecommends] = useState(true);

  const destReviews = reviews.filter((r) => r.destinationId === destinationId);
  const averageRating =
    destReviews.length > 0
      ? (destReviews.reduce((acc, r) => acc + r.rating, 0) / destReviews.length).toFixed(1)
      : '4.8';

  return (
    <div id="traveler-reviews-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800 space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono">
            ⭐ VISITOR RATINGS & ADVICE
          </span>
          <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            Traveler Reviews
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Read verified reviews, star ratings, and seasonal recommendations for {destinationName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-2xl font-black text-slate-900 dark:text-white">
              {averageRating}
            </span>
            <span className="block text-[10px] text-slate-450 dark:text-slate-500 uppercase font-mono tracking-wider font-black">
              Average Rating
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="block text-2xl font-black text-slate-900 dark:text-white">
              {destReviews.length}
            </span>
            <span className="block text-[10px] text-slate-450 dark:text-slate-500 uppercase font-mono tracking-wider font-black">
              Reviews Count
            </span>
          </div>
        </div>
      </div>

      {/* Review Submission Form / Modal Trigger */}
      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4">
        <h5 className="font-black text-sm text-slate-850 dark:text-slate-200 uppercase tracking-wide">
          ✍️ Write your Traveler Review
        </h5>
        {user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.currentTarget;
              const title = (target.elements.namedItem('reviewTitle') as HTMLInputElement).value;
              const content = (target.elements.namedItem('reviewContent') as HTMLTextAreaElement).value;
              const visitDate = (target.elements.namedItem('reviewVisitDate') as HTMLInputElement).value;

              onAddReview(destinationId, formRating, title, content, visitDate, formRecommends);
              target.reset();
              setFormRating(5);
              setFormRecommends(true);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wide">
                  Your Star Rating *
                </label>
                <div className="flex gap-1.5 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormRating(star)}
                      className="text-2xl transition hover:scale-115 cursor-pointer"
                    >
                      {star <= formRating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 font-mono">
                    {formRating}/5 stars
                  </span>
                </div>
              </div>

              {/* Recommends Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wide">
                  Would you recommend visiting? *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRecommends(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      formRecommends
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    👍 Yes, Absolutely
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRecommends(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      !formRecommends
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    👎 No, Skip
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Review Title */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wide">
                  Review Heading *
                </label>
                <input
                  type="text"
                  name="reviewTitle"
                  placeholder="e.g., Hidden piece of heaven, stunning views!"
                  required
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-emerald-500 dark:text-white"
                />
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wide">
                  When did you visit? *
                </label>
                <input
                  type="date"
                  name="reviewVisitDate"
                  required
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-emerald-500 dark:text-white"
                />
              </div>
            </div>

            {/* Review content */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wide">
                Detailed Review content *
              </label>
              <textarea
                name="reviewContent"
                rows={3}
                placeholder="Tell us about your experience, homestay vibes, must-see sights, transit advice..."
                required
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-emerald-500 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 px-6 rounded-xl transition cursor-pointer shadow-md"
            >
              Submit Traveler Review & Rating
            </button>
          </form>
        ) : (
          <div className="text-center py-4 font-sans text-xs text-slate-500">
            🔐{' '}
            <button
              type="button"
              onClick={onLogin}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Sign in with Google
            </button>{' '}
            to post your ratings, star reviews, and local sightseeing advice.
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {destReviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No reviews have been submitted for this destination yet. Share your experience!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {destReviews.map((r) => (
              <div
                key={r.id}
                className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Stars */}
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-sm">
                          {i < r.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{r.title}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Visit Date:{' '}
                    {new Date(r.visitDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>

                <p className="text-slate-650 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                  {r.content}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/50 text-[10px]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-400">By {r.userName}</span>
                    <span className="text-slate-300">•</span>
                    <span className={r.recommends ? 'text-emerald-650 dark:text-emerald-400' : 'text-rose-600'}>
                      {r.recommends ? '👍 Recommends this place' : '👎 Does not recommend'}
                    </span>
                  </div>

                  {((user && user.uid === r.userId) || isAdmin) && (
                    <button
                      onClick={() => onDeleteReview(r.id)}
                      className="text-red-500 hover:text-red-600 font-bold uppercase cursor-pointer"
                    >
                      Delete Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
