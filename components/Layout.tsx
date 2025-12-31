import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, User, Sparkles, LogOut, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { stats, logout, user } = useContext(AppContext);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Sparkles, label: 'Progress', path: '/progress' },
    { icon: Trophy, label: 'Ranking', path: '/ranking' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    ...(user?.role === 'admin' ? [{ icon: Users, label: 'User Management', path: '/users' }] : []),
  ];

  return (
    <div className="relative h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-[#0f172a]">

      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400/20 dark:bg-pink-600/10 rounded-full mix-blend-multiply blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden p-4 glass sticky top-0 z-50 flex items-center justify-between">
        <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text flex items-center gap-2">
          <Sparkles size={18} className="text-blue-500" /> CU Talking
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-bold px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg">BETA</div>
          <button onClick={logout} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar (Glassmorphism) */}
      <aside className="hidden md:flex flex-col w-72 glass z-40 m-4 rounded-3xl border-r-0 shadow-2xl sticky top-4 h-[calc(100vh-2rem)]">
        <div className="p-8">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 text-transparent bg-clip-text flex items-center gap-3">
            <img src="/logo.jpg" alt="CU Talking Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-500/30" />
            CU Talking
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative group"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/30'
                  }`}>
                  <item.icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-2 opacity-70 group-hover:opacity-100'} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Your Progress / Stars Section - Only for non-admins */}
        {user?.role !== 'admin' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />

              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-yellow-500" /> Your Progress
              </p>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="text-3xl">⭐</div>
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full shadow-sm">
                    Lvl {Math.floor((stats.stars || 0) / 10) + 1}
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                    {stats.stars || 0}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stars</span>
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats.stars || 0) % 10) * 10}%` }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-center mt-2">
                {10 - ((stats.stars || 0) % 10)} stars to next level
              </p>
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-semibold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden z-10 relative">
        <div className="h-full overflow-y-auto rounded-3xl pb-24 md:pb-0 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-6xl mx-auto w-full min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav (Floating Glass) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 glass rounded-2xl p-2 flex justify-around z-50 shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-6 py-3 rounded-xl flex flex-col items-center transition-all ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNav"
                  className="absolute inset-0 bg-blue-100 dark:bg-blue-500/20 rounded-xl -z-10"
                />
              )}
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          )
        })}
      </nav>
    </div>
  );
};