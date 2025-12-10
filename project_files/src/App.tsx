import { useState } from 'react';
import Header from './components/Header';
import SingleReviewAnalyzer from './components/SingleReviewAnalyzer';
import AspectAnalyzer from './components/AspectAnalyzer';
import BatchAnalyzer from './components/BatchAnalyzer';
import Dashboard from './components/Dashboard';

type Tab = 'single' | 'aspect' | 'batch' | 'dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('single');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-200">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-700 p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/50 scale-105'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Single Review
          </button>
          <button
            onClick={() => setActiveTab('aspect')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'aspect'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/50 scale-105'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Aspect Analysis
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'batch'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/50 scale-105'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Batch Analysis
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/50 scale-105'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Dashboard
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'single' && <SingleReviewAnalyzer />}
          {activeTab === 'aspect' && <AspectAnalyzer />}
          {activeTab === 'batch' && <BatchAnalyzer />}
          {activeTab === 'dashboard' && <Dashboard />}
        </div>
      </div>

      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12 transition-colors duration-200">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Powered by BERT (DistilBERT) | Flask + React | Sentiment Analysis with Aspect Extraction
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
