import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Sparkles, ArrowRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../constants';
import WelcomeMobile from './WelcomeMobile';

interface WelcomeProps {
    onLogin: (user: any, token: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <WelcomeMobile onLogin={onLogin} />;
    }

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
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
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
        <div className="h-screen w-full relative overflow-hidden bg-[#020617] flex items-center justify-center p-6">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/language_learning_bg.png')] bg-cover bg-center opacity-[0.03]" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#020617] to-purple-900/20" />

                {/* Floating Particles/Glows */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            x: [0, Math.random() * 100 - 50, 0],
                            y: [0, Math.random() * 100 - 50, 0],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                            duration: 15 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute rounded-full blur-[120px]"
                        style={{
                            width: `${400 + Math.random() * 400}px`,
                            height: `${400 + Math.random() * 400}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(147, 51, 234, 0.1)',
                        }}
                    />
                ))}
            </div>

            {/* Unified Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 w-full max-w-5xl"
            >
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[3rem] p-8 lg:p-16 shadow-2xl overflow-hidden relative">
                    {/* Subtle inner glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        {/* Left Side: Branding & Info */}
                        <div className="flex-1 space-y-8">
                            <div>


                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-4xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight"
                                >
                                    CU Talking with <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                        Intelligence.
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-lg text-slate-400 leading-relaxed font-medium max-w-md"
                                >
                                    Experience immersive AI conversations that adapt to your fluency level in real-time.
                                </motion.p>
                            </div>

                            {/* Feature Grid - More compact */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Globe, title: "Global Scenarios", color: "text-blue-400" },
                                    { icon: Sparkles, title: "AI Feedback", color: "text-purple-400" },
                                    { icon: User, title: "Smart Avatars", color: "text-indigo-400" },
                                    { icon: ArrowRight, title: "Fast Progress", color: "text-emerald-400" }
                                ].map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + idx * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all group"
                                    >
                                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform`}>
                                            <feature.icon size={16} />
                                        </div>
                                        <span className="text-white text-xs font-bold">{feature.title}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-12 pt-4">
                                {[
                                    { label: "Availability", value: "24/7" },
                                    { label: "Personalized", value: "100%" },
                                    { label: "Powered", value: "AI" }
                                ].map((stat, idx) => (
                                    <div key={idx}>
                                        <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Login Form */}
                        <div className="w-full lg:w-[400px]">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative"
                            >
                                {/* Branding */}
                                <div className="text-center mb-10">
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        src="/LogoCU.png"
                                        alt="CU Talking Logo"
                                        className="h-48 w-auto mx-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                    />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-xs text-center font-bold"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/[0.05] rounded-2xl py-4 pl-12 pr-5 text-white text-sm placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                placeholder="Enter username"
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
                                                className="w-full bg-slate-950/50 border border-white/[0.05] rounded-2xl py-4 pl-12 pr-5 text-white text-sm placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 mt-8 group"
                                    >
                                        {isLoading ? (
                                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-10 text-center">
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">
                                        Powered by MagaSoft
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Welcome;
