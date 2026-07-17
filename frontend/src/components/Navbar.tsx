import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, BrainCircuit, Sun, Moon } from 'lucide-react';
import { useSearchStore } from '../stores/useSearchStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const setSearchOpen = useSearchStore((state) => state.setSearchOpen);
  const setChatOpen = useSearchStore((state) => state.setChatOpen);
  const isChatOpen = useSearchStore((state) => state.isChatOpen);
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useThemeStore();

  // Keyboard shortcut Ctrl + K for universal search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/notes':
        return 'Smart Notes';
      case '/documents':
        return 'Smart Documents';
      default:
        return 'LifeOS';
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white/40 dark:bg-slate-950/20 border-b border-slate-200 dark:border-darkBorder backdrop-blur-sm">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wide">{getPageTitle()}</h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">LifeOS Personal AI Assistant</p>
      </div>

      {/* Center Search Input Trigger */}
      <div 
        onClick={() => setSearchOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-100/80 border border-slate-250 text-slate-500 hover:text-slate-700 hover:border-slate-350 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:border-slate-700/80 cursor-pointer transition-all duration-200 w-80 shadow-inner"
      >
        <Search size={16} className="text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-medium flex-1">Search your brain...</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 select-none shadow">Ctrl K</kbd>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Ask AI Chat button */}
        <button
          onClick={() => setChatOpen(!isChatOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-md ${
            isChatOpen 
              ? 'bg-cyberBlue/10 border-cyberBlue text-cyberBlue shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:border-cyberBlue/40 hover:text-cyberBlue'
          }`}
        >
          <BrainCircuit size={15} />
          <span>LifeOS Assistant</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-cyberBlue/40 active:scale-95 transition-all duration-200 shadow-md hover:shadow-[0_0_10px_rgba(0,229,255,0.1)] flex items-center justify-center"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? (
            <Sun size={15} className="text-yellow-500 fill-yellow-500/20" />
          ) : (
            <Moon size={15} className="text-indigo-600 fill-indigo-600/20" />
          )}
        </button>

        {/* User initials badge */}
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-darkBorder pl-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-neonPurple to-cyberBlue flex items-center justify-center font-bold text-white shadow-sm border border-slate-200 dark:border-slate-800">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-300">{user.username}</span>
          </div>
        )}
      </div>
    </header>
  );
};
