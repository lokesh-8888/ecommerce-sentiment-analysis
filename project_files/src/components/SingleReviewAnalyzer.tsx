import { useState } from 'react';
import { Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { predictSentiment } from '../services/api';
import type { SentimentResult } from '../types';

export default function SingleReviewAnalyzer() {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!review.trim()) {
      setError('Please enter a review');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await predictSentiment(review);
      setResult(data);
    } catch (err) {
      setError('Failed to analyze review. Make sure the Flask server is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-all duration-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Single Review Analysis
        </h2>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3 text-lg">
          Enter Product Review
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-colors"
          rows={6}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Example: This product is amazing! The battery life is incredible and the build quality is excellent..."
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Analyze Sentiment
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`p-6 rounded-xl border-2 shadow-md ${
              result.sentiment === 'Positive'
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              {result.sentiment === 'Positive' ? (
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                  <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                  <ThumbsDown className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              )}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {result.sentiment} Sentiment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Confidence: <span className="font-bold">{result.confidence}%</span>
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Positive Score:
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                    {result.positive_score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${result.positive_score}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Negative Score:
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                    {result.negative_score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${result.negative_score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
