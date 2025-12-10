import { useState } from 'react';
import { Search, Loader2, TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';
import { analyzeAspects } from '../services/api';
import type { AspectAnalysis } from '../types';

export default function AspectAnalyzer() {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AspectAnalysis | null>(null);
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
      const data = await analyzeAspects(review);
      setResult(data);
    } catch (err) {
      setError('Failed to analyze aspects. Make sure the Flask server is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Aspect-Based Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Extract product strengths and weaknesses from reviews
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3 text-lg">
          Enter Detailed Product Review
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-colors"
          rows={7}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Example: The battery life is excellent and lasts all day. The camera quality is amazing in good light. However, the build quality feels a bit cheap and the delivery was delayed..."
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
            Extracting Aspects...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Extract Aspects
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`p-5 rounded-xl border-2 shadow-md ${
              result.overall_sentiment.sentiment === 'Positive'
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700'
            }`}
          >
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-3">
              Overall Sentiment
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {result.overall_sentiment.sentiment}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ({result.overall_sentiment.confidence}% confidence)
              </span>
            </div>
          </div>

          {result.strengths.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-700 shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Strengths ({result.strengths.length})
                </h3>
              </div>

              <div className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-700 rounded-lg p-4 border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg mt-0.5">
                        <Award className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                            {strength.aspect}
                          </h4>
                          <span className="text-green-600 dark:text-green-400 font-semibold text-sm bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                            {strength.confidence}%
                          </span>
                        </div>
                        {strength.example && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm italic mt-2">
                            "{strength.example}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.weaknesses.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-300 dark:border-red-700 shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Weaknesses ({result.weaknesses.length})
                </h3>
              </div>

              <div className="space-y-3">
                {result.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-700 rounded-lg p-4 border-2 border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg mt-0.5">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                            {weakness.aspect}
                          </h4>
                          <span className="text-red-600 dark:text-red-400 font-semibold text-sm bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                            {weakness.confidence}%
                          </span>
                        </div>
                        {weakness.example && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm italic mt-2">
                            "{weakness.example}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.strengths.length === 0 && result.weaknesses.length === 0 && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-600 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                No specific product aspects detected. Try adding more detailed information about
                features like battery, performance, quality, design, etc.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
