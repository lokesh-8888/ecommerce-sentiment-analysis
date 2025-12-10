import { ShoppingBag, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white shadow-xl border-b border-blue-700 dark:border-blue-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">E-Commerce Review Analyzer</h1>
              <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
                AI-Powered Sentiment Analysis with BERT
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/20 dark:border-white/10 hover:scale-105 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-6 h-6" />
            ) : (
              <Sun className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
