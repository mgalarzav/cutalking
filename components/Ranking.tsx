import React, { useState, useEffect, useContext } from 'react';
import { Trophy, Medal, Crown, Sparkles, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { API_URL } from '../constants';

interface LeaderboardUser {
    id: number;
    username: string;
    stars: number;
    role: string;
    profile_picture?: string;
}

const Ranking: React.FC = () => {
    const { user: currentUser } = useContext(AppContext);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('You are not logged in.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_URL}/api/leaderboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    throw new Error('Session expired. Please log in again.');
                }

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || `Server Error: ${response.status}`);
                }

                const data = await response.json();
                setLeaderboard(data);
            } catch (err: any) {
                console.error("Ranking Fetch Error:", err);
                // Handle "Failed to fetch" which is usually CORS or Network
                if (err.message === 'Failed to fetch') {
                    setError('Cannot reach the server. Please check if the backend is running.');
                } else {
                    setError(err.message || 'Error loading ranking');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown size={24} className="text-yellow-500 fill-yellow-500" />;
            case 1: return <Medal size={24} className="text-slate-400 fill-slate-400" />;
            case 2: return <Medal size={24} className="text-amber-700 fill-amber-700" />;
            default: return <Trophy size={20} className="text-slate-300" />;
        }
    };

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-500/50 dark:text-yellow-400';
            case 1: return 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-300';
            case 2: return 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-400';
            default: return 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400';
        }
    };

    const getUserTitle = (stars: number) => {
        if (stars >= 500) return { label: 'Vibe Coder', color: 'bg-yellow-400 text-yellow-900' };
        if (stars >= 300) return { label: 'Master', color: 'bg-purple-400 text-purple-900' };
        if (stars >= 150) return { label: 'Builder', color: 'bg-green-400 text-green-900' };
        return { label: 'Creator', color: 'bg-blue-400 text-blue-900' };
    };

    const currentUserRank = leaderboard.findIndex(u => u.id === currentUser?.id) + 1;
    const currentUserData = leaderboard.find(u => u.id === currentUser?.id);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <header className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-2">
                    <Trophy size={48} className="text-yellow-500 fill-yellow-500 animate-bounce-slow" />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    CU - Community Ranking
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                    The top 10 most active students
                </p>
            </header>

            {/* Current User Stats Card */}
            {currentUser && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-card p-6 rounded-2xl border-2 border-yellow-400/30 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 flex items-center justify-between shadow-xl shadow-yellow-500/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500 rounded-xl text-white shadow-lg shadow-yellow-500/30">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Your Current Position</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Keep learning to rise up!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {currentUserRank > 0 ? (
                            <div className="px-4 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-xl shadow-lg">
                                #{currentUserRank}
                            </div>
                        ) : (
                            <div className="px-4 py-2 bg-slate-200 text-slate-600 font-bold rounded-xl">
                                Not Ranked
                            </div>
                        )}
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {currentUserData?.stars || 0} <span className="text-sm font-bold text-slate-500">pts</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Leaderboard List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading ranking...</div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                        <p className="font-bold">Oops! Could not load the leaderboard.</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                ) : (
                    leaderboard.map((user, index) => {
                        const title = getUserTitle(user.stars);
                        const isCurrentUser = user.id === currentUser?.id;

                        return (
                            <motion.div
                                key={user.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-4 rounded-2xl border-2 flex items-center gap-4 transition-all hover:scale-[1.02] ${getRankColor(index)} ${isCurrentUser ? 'ring-4 ring-blue-500/20 z-10' : ''}`}
                            >
                                <div className="flex-shrink-0 w-12 text-center font-black text-xl opacity-50">
                                    #{index + 1}
                                </div>

                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-inner overflow-hidden">
                                        {user.profile_picture ? (
                                            <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            index < 3 ? getRankIcon(index) : <UserIcon size={20} className="text-slate-500" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg truncate flex items-center gap-2">
                                        {user.username}
                                        {isCurrentUser && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">(You)</span>}
                                    </h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${title.color}`}>
                                        {title.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/20 rounded-xl backdrop-blur-sm">
                                    <Sparkles size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span className="font-black text-lg">{user.stars}</span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Ranking;
