import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Sparkles, ArrowRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeProps {
    onLogin: (user: any, token: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/login', {
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
        <div className="h-screen w-full relative overflow-hidden bg-[#020617] flex flex-col lg:flex-row">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/language_learning_bg.png')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#020617] to-purple-900/20" />

                {/* Floating Particles/Glows */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            x: [0, Math.random() * 100 - 50, 0],
                            y: [0, Math.random() * 100 - 50, 0],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute rounded-full blur-[100px]"
                        style={{
                            width: `${300 + Math.random() * 300}px`,
                            height: `${300 + Math.random() * 300}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(147, 51, 234, 0.15)',
                        }}
                    />
                ))}
            </div>

            {/* Left Side: Information & Features */}
            <div className="flex-[1.2] relative z-10 flex items-center justify-center p-6 lg:p-16 overflow-y-auto">
                <div className="max-w-xl w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-400/80 text-[9px] font-bold uppercase tracking-[0.25em] mb-6">
                            <Sparkles size={10} />
                            <span>Next-Gen Language Platform</span>
                        </div>

                        <h1 className="text-3xl lg:text-5xl font-black text-white mb-5 leading-[1.15] tracking-tight">
                            Master English with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                Intelligence.
                            </span>
                        </h1>

                        <p className="text-base text-slate-400/90 mb-10 leading-relaxed font-medium max-w-md">
                            Experience immersive AI conversations that adapt to your fluency level in real-time.
                        </p>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            {[
                                { icon: Globe, title: "Global Scenarios", desc: "Real-world business & social contexts." },
                                { icon: Sparkles, title: "AI Feedback", desc: "Instant linguistic corrections & tips." },
                                { icon: User, title: "Smart Avatars", desc: "Natural voices & realistic interactions." },
                                { icon: ArrowRight, title: "Fast Progress", desc: "Accelerate your fluency by 3x." }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.1 }}
                                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-400/70 mb-3 group-hover:scale-110 transition-transform">
                                        <feature.icon size={18} />
                                    </div>
                                    <h3 className="text-white text-sm font-bold mb-1">{feature.title}</h3>
                                    <p className="text-slate-500 text-[11px] leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-10 border-t border-white/[0.05] pt-8">
                            <div>
                                <div className="text-xl font-black text-white/90 mb-0.5">24/7</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Availability</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white/90 mb-0.5">100%</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Personalized</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white/90 mb-0.5">AI</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Powered</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 relative z-10 flex items-center justify-center p-6 lg:p-16 bg-white/[0.01] lg:bg-transparent overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-[380px]"
                >
                    <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                        {/* Branding */}
                        <div className="text-center mb-8">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                src="/LogoCU.png"
                                alt="CU Talking Logo"
                                className="h-40 w-auto mx-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/5 border border-red-500/10 text-red-400/80 p-3 rounded-xl mb-6 text-[11px] text-center font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-950/40 border border-white/[0.05] rounded-xl py-3.5 pl-11 pr-5 text-white text-sm placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950/40 border border-white/[0.05] rounded-xl py-3.5 pl-11 pr-5 text-white text-sm placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-6 text-sm group"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.3em]">
                                Powered by MagaSoft.cloud
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Welcome;
