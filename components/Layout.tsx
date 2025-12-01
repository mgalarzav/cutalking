import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, User, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
      
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
        <div className="text-[10px] font-bold px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg">BETA</div>
      </div>

      {/* Desktop Sidebar (Glassmorphism) */}
      <aside className="hidden md:flex flex-col w-72 glass z-40 m-4 rounded-3xl border-r-0 shadow-2xl sticky top-4 h-[calc(100vh-2rem)]">
        <div className="p-8">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 text-transparent bg-clip-text flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <BookOpen size={20} strokeWidth={3} />
            </div>
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
                <div className={`relative z-10 flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
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

        <div className="p-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Weekly Streak</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">🔥 5 Days</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden z-10 relative h-screen">
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
                    className={`relative px-6 py-3 rounded-xl flex flex-col items-center transition-all ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
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