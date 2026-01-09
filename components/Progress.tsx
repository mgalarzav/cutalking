import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { SCENARIOS, API_URL } from '../constants';

const Progress: React.FC = () => {
    const { stats, settings, user, updateStats } = useContext(AppContext);
    const [scenarioProgress, setScenarioProgress] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/progress`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const progressMap: Record<string, number> = {};
                    data.forEach((item: any) => {
                        progressMap[item.scenario_id] = item.progress;
                    });
                    setScenarioProgress(progressMap);

                    // Sync global stats based on actual progress
                    const completedCount = Object.values(progressMap).filter(p => p === 100).length;
                    const calculatedStars = completedCount * 1; // 1 star per completed dialogue

                    updateStats({
                        stars: calculatedStars,
                        dialoguesCompleted: completedCount,
                        level: Math.floor(calculatedStars / 10) + 1
                    });

                    // Update local storage to persist
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    if (storedUser) {
                        storedUser.stars = calculatedStars;
                        localStorage.setItem('user', JSON.stringify(storedUser));
                    }
                }
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };
        fetchProgress();
    }, []);

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="glass-card p-8 rounded-[2rem] flex items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                        Your Progress
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        Track your mastery across different scenarios.
                    </p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                                try {
                                    const token = localStorage.getItem('token');
                                    const response = await fetch(`${API_URL}/api/progress`, {
                                        method: 'DELETE',
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    if (response.ok) {
                                        setScenarioProgress({});

                                        // Sync with server to ensure DB is updated to 0 stars
                                        if (user && user.id) {
                                            await fetch(`${API_URL}/api/users/${user.id}/sync-stars`, {
                                                method: 'POST',
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                        }

                                        updateStats({
                                            stars: 0,
                                            xp: 0,
                                            dialoguesCompleted: 0,
                                            level: 1
                                        });

                                        // Also update user in localStorage to prevent sync issues on reload
                                        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                                        if (storedUser) {
                                            storedUser.stars = 0;
                                            localStorage.setItem('user', JSON.stringify(storedUser));
                                        }
                                    }
                                } catch (error) {
                                    console.error('Error resetting progress:', error);
                                }
                            }
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/30 flex items-center gap-2"
                    >
                        <Icons.RefreshCw size={18} />
                        Reset Progress
                    </button>
                </div>
            </div>

            {/* Journey Progress - Blocks */}
            <div className="glass-card p-8 rounded-[2rem]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Journey Progress</h3>
                    <div className="px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                        {Object.values(scenarioProgress).filter(p => p === 100).length} Dialogues Completed
                    </div>
                </div>

                <div className="relative flex items-center justify-between px-4">
                    {/* Progress Line Background */}
                    <div className="absolute top-6 left-0 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full -z-10" />

                    {/* Progress Line Active */}
                    <div
                        className="absolute top-6 left-0 h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full -z-10 transition-all duration-1000"
                        style={{ width: `${Math.min(100, (Object.values(scenarioProgress).filter(p => p === 100).length / 10) * 100)}%` }}
                    />

                    {[2, 4, 6, 8, 10].map((milestone, index) => {
                        const completedCount = Object.values(scenarioProgress).filter(p => p === 100).length;
                        const prevMilestone = index === 0 ? 0 : [2, 4, 6, 8, 10][index - 1];
                        const isCompleted = completedCount >= milestone;
                        const isCurrent = completedCount >= prevMilestone && completedCount < milestone;
                        const cost = milestone - prevMilestone;

                        return (
                            <div key={index} className="relative flex flex-col items-center gap-3">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border-4 transition-all z-10
                                    ${isCompleted
                                            ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30 scale-110'
                                            : isCurrent
                                                ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-500 ring-4 ring-blue-500/20'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300'
                                        }`}
                                >
                                    {isCompleted ? <Icons.CheckCircle size={20} /> : index + 1}
                                </motion.div>

                                <div className="absolute -bottom-8 text-xs font-medium text-slate-500 whitespace-nowrap">
                                    {cost} Dialogues
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-12 text-center text-sm text-slate-400">
                    Complete dialogues to unlock new blocks! Each block requires 2 dialogues.
                </div>
            </div>

            {/* Scenario Mastery Section */}
            <div className="glass-card p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-green-500 rounded-full" /> Scenario Mastery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SCENARIOS.map((scenario) => {
                        const progress = scenarioProgress[scenario.id] || 0;
                        const IconComponent = (Icons as any)[scenario.icon] || Icons.MessageCircle;

                        return (
                            <div key={scenario.id} className="relative p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${scenario.color} text-white shadow-lg`}>
                                    <IconComponent size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{scenario.title}</h4>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        />
                                    </div>
                                </div>
                                <div className="font-bold text-slate-500 dark:text-slate-400 text-sm">
                                    {progress}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Progress;
