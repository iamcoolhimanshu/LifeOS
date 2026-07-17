import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Calendar,
  CheckSquare,
  Target,
  GraduationCap,
  Briefcase,
  DollarSign,
  Network,
  BarChart3,
  Plug,
  Smartphone,
  Settings,
  LogOut, 
  Menu, 
  ChevronLeft, 
  Brain,
  Mail
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'AI Inbox', path: '/email', icon: Mail },
    { name: 'Smart Notes', path: '/notes', icon: FileText },
    { name: 'Documents', path: '/documents', icon: FolderOpen },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Learning', path: '/learning', icon: GraduationCap },
    { name: 'Career', path: '/career', icon: Briefcase },
    { name: 'Finance', path: '/finance', icon: DollarSign },
    { name: 'Knowledge Graph', path: '/graph', icon: Network },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Integrations', path: '/integrations', icon: Plug },
    { name: 'Mobile Simulator', path: '/mobile-simulator', icon: Smartphone },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`glass-card h-[calc(100vh-2rem)] m-4 hidden md:flex flex-col justify-between transition-all duration-300 relative ${
        collapsed ? 'w-20' : 'w-64'
      } border border-slate-200 dark:border-darkBorder`}
      style={{ borderRightWidth: '1px' }}
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Toggle Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-[-12px] top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyberBlue rounded-full p-1.5 hover:text-white dark:hover:text-white hover:border-cyberBlue transition-all duration-200"
        >
          {collapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8 select-none shrink-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-neonPurple to-cyberBlue shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <span className="text-white font-bold text-xl leading-none">L</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-slate-800 via-slate-700 to-cyberBlue dark:from-white dark:via-slate-100 dark:to-cyberBlue bg-clip-text text-transparent">LifeOS</span>
              <span className="text-[10px] font-medium text-cyberBlue uppercase tracking-widest leading-none mt-0.5">Digital Brain</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 px-3 overflow-y-auto scroll-custom flex-1 pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-neonPurple/20 to-cyberBlue/10 border-l-2 border-cyberBlue text-slate-900 dark:text-white shadow-[0_0_15px_rgba(0,229,255,0.05)]'
                      : 'text-slate-500 hover:text-slate-950 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon size={20} className="transition-transform group-hover:scale-110" />
                {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Signout */}
      <div className="p-3 border-t border-slate-200 dark:border-darkBorder flex flex-col gap-2">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-200/30 border border-slate-250 dark:bg-slate-900/40 dark:border-slate-900/50 mb-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-neonPurple to-cyberBlue flex items-center justify-center font-bold text-white shadow-md">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.username}</span>
              <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all duration-200 w-full group`}
        >
          <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
