import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Building2, Star, ThumbsUp, MessageSquare, Camera, CheckCircle2, TrendingUp, RefreshCw, Copy, Check } from 'lucide-react';
import { AIBusinessOptimization } from '../../types/aiPlatform';

export const AIBusinessAssistantView: React.FC = () => {
  const [businessName, setBusinessName] = useState('Kanchenjunga Bliss Homestay');
  const [description, setDescription] = useState('Clean rooms with mountain views and home cooked meals.');
  const [reviewsInput, setReviewsInput] = useState('Great organic food and quiet location, but hot water took time to heat up.');
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<AIBusinessOptimization | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/ai/business-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: 'biz-demo-1',
          businessName,
          currentDescription: description,
          recentReviews: [
            { id: 'rev-1', rating: 4, comment: reviewsInput }
          ]
        })
      });

      if (!res.ok) throw new Error('Optimization failed');

      const data = await res.json();
      if (data.structuredData) {
        setOptimizationResult(data.structuredData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopyReply = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Business & Host Optimizer</h3>
            <p className="text-xs text-slate-400">Boost your homestay or taxi booking conversions with AI listing enhancements and review responses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Property / Vehicle Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Recent Guest Review</label>
            <input
              type="text"
              value={reviewsInput}
              onChange={(e) => setReviewsInput(e.target.value)}
              className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Current Listing Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            {isOptimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Optimize Listing & Analyze Reviews</span>
          </button>
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Score & Title Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="text-center md:border-r md:border-slate-800 pr-4">
              <div className="text-xs font-bold text-slate-400 uppercase">AI Listing Quality Score</div>
              <div className="text-4xl font-black text-rose-500 mt-2">{optimizationResult.overallScore} / 100</div>
              <p className="text-[11px] text-emerald-400 mt-1 font-semibold">High Conversion Potential</p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                  High Impact Title Suggestion
                </span>
                <h4 className="text-base font-bold text-white mt-1">{optimizationResult.titleSuggestion}</h4>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  Enhanced Storytelling Description
                </span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{optimizationResult.descriptionImprovement}</p>
              </div>
            </div>
          </div>

          {/* Amenities & Photo Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recommended High-Demand Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {optimizationResult.recommendedAmenities.map((amenity, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-950 text-emerald-300 text-xs rounded-xl border border-slate-800 font-semibold">
                    + {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" /> Photo Optimization Guidance
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {optimizationResult.photoOptimizationTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Review Sentiment & Automated Reply Suggestion */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-400" /> AI Guest Review Sentiment & Reply Assistant
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase block mb-1">Positive Guest Themes</span>
                <div className="flex flex-wrap gap-1.5">
                  {optimizationResult.reviewSentimentSummary.positiveThemes.map((theme, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-[11px] rounded border border-emerald-500/20">
                      ✓ {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-rose-400 uppercase block mb-1">Areas For Host Attention</span>
                <div className="flex flex-wrap gap-1.5">
                  {optimizationResult.reviewSentimentSummary.negativeThemes.map((theme, i) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 text-[11px] rounded border border-rose-500/20">
                      ⚠️ {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reply Suggestion Box */}
            {optimizationResult.suggestedReviewReplies.map((reply, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Guest Review: "{reply.reviewSnippet}"</div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-200 relative">
                  <p className="pr-12">{reply.suggestedReplyText}</p>
                  <button
                    onClick={() => handleCopyReply(reply.suggestedReplyText, idx)}
                    className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer"
                    title="Copy response text"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
