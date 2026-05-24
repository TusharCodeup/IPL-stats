import React, { memo, useState } from 'react';
import useAuthStore from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Tv2, 
  BarChart3, 
  History, 
  ShieldAlert, 
  LogOut, 
  User,
  Sun,
  Moon,
  Settings,
  Trophy,
  Users,
  Star,
  Menu,
  X,
  Award,
  Calendar
} from 'lucide-react';

const Navbar = memo(({ activePage, setActivePage }) => {
  const { username, role, logout, credits, subscription } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', name: 'Live Sim', icon: Tv2 },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'legends', name: 'IPL Legends', icon: Trophy },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'players', name: 'Players', icon: Star },
    { id: 'points', name: 'Points Table', icon: Award },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'historical', name: 'History', icon: History },
    { id: 'accuracy', name: 'MLOps', icon: ShieldAlert },
  ];

  return (
    <>
      <nav className="border-b border-slate-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-[#0e1322]/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-2xl drop-shadow-md">🏏</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-500 font-sans tracking-wide whitespace-nowrap leading-tight">
                IPL CRIC-AI
              </span>
              <span className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase whitespace-nowrap leading-tight">
                Predictive Analytics
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex space-x-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 dark:hover:text-gray-200 border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* User Profile / theme / Logout */}
          <div className="flex items-center space-x-3">
            {/* Credits Remaining Badge */}
            <div 
              onClick={() => setActivePage('settings')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-gray-800 bg-indigo-50/50 dark:bg-gray-900/50 cursor-pointer text-xs font-semibold select-none text-slate-800 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-emerald-500/30 transition-all active:scale-[0.98]"
            >
              <span>🪙</span>
              <span>{subscription === 'pro' ? 'Pro' : `${credits} Creds`}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setActivePage('settings')}
              title="Account Settings & Billing"
              className={`p-2.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors ${
                activePage === 'settings' 
                  ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/25 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25'
                  : 'border-slate-200 dark:border-gray-800'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {/* Profile badge */}
            <div 
              onClick={() => setActivePage('settings')}
              className="flex items-center space-x-2 text-right hidden sm:flex cursor-pointer group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-500 dark:group-hover:text-emerald-400 transition-colors">{username}</span>
                <span className="text-[9px] font-black text-indigo-500 dark:text-cyan-400 uppercase tracking-wider">{role}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-slate-200/50 dark:border-gray-700/50 group-hover:border-indigo-300 dark:group-hover:border-emerald-500/25 transition-all">
                <User className="w-4 h-4" />
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              title="Logout"
              className="flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all duration-200"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-x-0 top-16 z-40 bg-white/95 dark:bg-[#0e1322]/95 backdrop-blur-xl border-b border-slate-200 dark:border-gray-800 shadow-xl animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setMobileOpen(false); }}
                  className={`flex items-center space-x-2 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
            <button
              onClick={() => { setActivePage('settings'); setMobileOpen(false); }}
              className="flex items-center space-x-2 px-3 py-3 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
