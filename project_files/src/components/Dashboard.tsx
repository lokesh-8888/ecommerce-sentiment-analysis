import { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { getStats } from '../services/api';
import type { Stats } from '../types';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics. Make sure the Flask server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? '#f1f5f9' : '#1f2937';
  const gridColor = isDark ? '#334155' : '#e5e7eb';

  const pieData = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        data: stats ? [stats.positive, stats.negative] : [0, 0],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: ['Positive Reviews', 'Negative Reviews'],
    datasets: [
      {
        label: 'Count',
        data: stats ? [stats.positive, stats.negative] : [0, 0],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
          font: {
            size: 14,
            weight: '500' as const,
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-all duration-200">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-all duration-200">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-all duration-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Analytics Dashboard
        </h2>
      </div>

      {stats && stats.total > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
              <p className="text-blue-100 dark:text-blue-200 text-sm mb-2 font-medium">
                Total Reviews
              </p>
              <p className="text-4xl md:text-5xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
              <p className="text-green-100 dark:text-green-200 text-sm mb-2 font-medium">
                Positive
              </p>
              <p className="text-4xl md:text-5xl font-bold">{stats.positive}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
              <p className="text-red-100 dark:text-red-200 text-sm mb-2 font-medium">Negative</p>
              <p className="text-4xl md:text-5xl font-bold">{stats.negative}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
              <p className="text-purple-100 dark:text-purple-200 text-sm mb-2 font-medium">
                Positive Rate
              </p>
              <p className="text-4xl md:text-5xl font-bold">{stats.positive_percentage}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-600 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                Sentiment Distribution
              </h3>
              <div className="h-64">
                <Pie data={pieData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-600 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                Review Count Comparison
              </h3>
              <div className="h-64">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={loadStats}
              className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Stats
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            No reviews analyzed yet
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Start analyzing reviews to see statistics and charts here
          </p>
        </div>
      )}
    </div>
  );
}
