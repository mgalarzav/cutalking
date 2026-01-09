import React, { useState } from 'react';
import { Lock, User, Sparkles, ArrowRight, Globe, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../constants';

interface WelcomeMobileProps {
    onLogin: (user: any, token: string) => void;
}

const WelcomeMobile: React.FC<WelcomeMobileProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'intro' | 'login'>('intro');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.user, data.token);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full relative overflow-hidden bg-[#020617] flex flex-col">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/language_learning_bg.png')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-[#020617] to-purple-900/20" />

                {/* Animated Glows */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [-20, 20, -20]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.15, 0.1],
                        x: [20, -20, 20]
                    }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full"
                />
            </div>

            <div className="relative z-10 flex-1 flex flex-col px-8 pt-12 pb-20">
                <AnimatePresence mode="wait">
                    {view === 'intro' ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1 flex flex-col"
                        >
                            {/* Logo Section */}
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.2
                                    }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full animate-pulse" />
                                    <img
                                        src="/LogoCU.png"
                                        alt="CU Talking Logo"
                                        className="w-56 h-auto relative z-10 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                                    />
                                </motion.div>
                            </div>

                            {/* Content Section */}
                            <div className="space-y-6 mb-8">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-4xl font-black text-white leading-[1.1] tracking-tight"
                                >
                                    CU Talking <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                        With AI.
                                    </span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="text-slate-400 text-lg leading-relaxed font-medium"
                                >
                                    Experience immersive conversations that adapt to your level in real-time.
                                </motion.p>
                            </div>

                            {/* Action Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                onClick={() => setView('login')}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95 transition-all group"
                            >
                                Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-4 text-center"
                            >
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.5em]">
                                    Powered by MagaSoft
                                </p>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-1 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-10">
                                <button
                                    onClick={() => setView('intro')}
                                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                                >
                                    <ArrowRight size={20} className="rotate-180" />
                                </button>
                                <img src="/LogoCU.png" alt="Logo" className="h-10 w-auto opacity-50" />
                            </div>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
                                <p className="text-slate-400 font-medium">Sign in to your account</p>
                            </div>

                            {/* Login Form Card */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50" />

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-xs font-bold text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4.5 pl-12 pr-5 text-white text-sm focus:ring-2 focus:ring-blue-500/30 outline-none transition-all placeholder:text-slate-700"
                                                placeholder="Enter your username"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4.5 pl-12 pr-5 text-white text-sm focus:ring-2 focus:ring-blue-500/30 outline-none transition-all placeholder:text-slate-700"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                    >
                                        {isLoading ? (
                                            <div className="w-6 h-6 border-3 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                        ) : (
                                            <>Sign In <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                </form>
                            </motion.div>

                            <div className="mt-auto pt-8 text-center">
                                <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.5em]">
                                    Powered by MagaSoft.cloud
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WelcomeMobile;
