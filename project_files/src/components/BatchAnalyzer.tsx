import { useState } from 'react';
import { FileText, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { batchPredict } from '../services/api';
import type { BatchResult } from '../types';

export default function BatchAnalyzer() {
  const [reviews, setReviews] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    const reviewList = reviews
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (reviewList.length === 0) {
      setError('Please enter at least one review (one per line)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await batchPredict(reviewList);
      setResult(data);
    } catch (err) {
      setError('Failed to analyze reviews. Make sure the Flask server is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Batch Review Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyze multiple reviews at once (one review per line)
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3 text-lg">
          Enter Multiple Reviews
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none font-mono text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-colors"
          rows={8}
          value={reviews}
          onChange={(e) => setReviews(e.target.value)}
          placeholder="Great product! Love it.&#10;Terrible quality, very disappointed.&#10;Good value for money.&#10;Fast delivery but product was damaged."
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {reviews.split('\n').filter((r) => r.trim().length > 0).length} reviews entered
        </p>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing Batch...
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            Analyze All Reviews
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-700 shadow-md">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 font-medium">
                Total Reviews
              </p>
              <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                {result.summary.total}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-5 border-2 border-green-200 dark:border-green-700 shadow-md">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 font-medium">Positive</p>
              <p className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                {result.summary.positive}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-5 border-2 border-red-200 dark:border-red-700 shadow-md">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 font-medium">Negative</p>
              <p className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400">
                {result.summary.negative}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-700 shadow-md">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 font-medium">
                Positive Rate
              </p>
              <p className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
                {result.summary.positive_percentage}%
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-md">
            <table className="min-w-full bg-white dark:bg-slate-800">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">
                    #
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">
                    Review
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">
                    Sentiment
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-200 dark:border-slate-700"
                  >
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-800 dark:text-gray-200 max-w-md">
                      {item.review}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {item.sentiment === 'Positive' ? (
                          <>
                            <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              Positive
                            </span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <span className="text-red-600 dark:text-red-400 font-semibold">
                              Negative
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-800 dark:text-gray-200 font-semibold">
                      {item.confidence}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
