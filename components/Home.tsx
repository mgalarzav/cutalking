import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { SCENARIOS } from '../constants';
import * as Icons from 'lucide-react';

import { groqService } from '../services/groqService';
import { deepgramService } from '../services/deepgramService';
import { AvatarId, Level } from '../types';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
    const { settings, updateSettings, user } = useContext(AppContext);
    const navigate = useNavigate();
    const [playing, setPlaying] = useState<string | null>(null);

    const playPreview = async (avatar: AvatarId, e: React.MouseEvent) => {
        e.stopPropagation();
        if (playing) return;
        setPlaying(avatar);

        const text = avatar === 'max'
            ? "Hi, I'm Max. I'll help you practice your English."
            : "Hello there, I'm Linda. Let's learn together!";

        // Try Groq TTS
        let buffer = await groqService.generateSpeech(text, avatar);

        // Fallback to Deepgram
        if (!buffer) {
            console.warn("Home: Groq TTS failed, attempting Deepgram fallback...");
            buffer = await deepgramService.generateSpeech(text, avatar);
        }

        if (buffer) {
            const ctx = new AudioContext();
            try {
                const audioBuffer = await ctx.decodeAudioData(buffer);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.start();
                source.onended = () => setPlaying(null);
            } catch (e) {
                console.error("Audio Decode Error", e);
                setPlaying(null);
            }
        } else {
            console.error("Home: All TTS services failed.");
            setPlaying(null);
        }
    };

    return (
        <div className="space-y-10 pb-12">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg bg-gradient-to-br from-blue-100 to-white flex items-center justify-center">
                        {user?.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-blue-600">
                                {user?.username?.charAt(0).toUpperCase() || settings.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Hello, <span className="text-blue-600 dark:text-blue-400">{user?.username || settings.name || 'Guest'}</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                            Ready to master English today?
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                    className="p-4 rounded-full glass shadow-lg hover:scale-110 transition-transform group"
                    aria-label="Toggle Dark Mode"
                >
                    {settings.darkMode ?
                        <Icons.Moon size={24} className="text-yellow-400 fill-yellow-400" /> :
                        <Icons.Sun size={24} className="text-orange-500 fill-orange-500" />
                    }
                </button>
            </header>

            {/* Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Avatar Selector - 3D Cards */}
                <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icons.User size={14} /> Teacher Selection
                    </h3>
                    <div className="flex gap-6">
                        {(['max', 'linda'] as AvatarId[]).map((av) => {
                            const isSelected = settings.avatar === av;
                            return (
                                <motion.div
                                    key={av}
                                    onClick={() => updateSettings({ avatar: av })}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 group flex-1 ${isSelected
                                        ? 'ring-4 ring-blue-500 shadow-xl shadow-blue-500/20'
                                        : 'hover:shadow-lg'
                                        }`}
                                >
                                    {/* Video Container - Full Card */}
                                    <div className="w-full aspect-[3/4] relative bg-slate-200 dark:bg-slate-800">
                                        <video
                                            src={av === 'max' ? '/max.mp4' : '/linda.mp4'}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="absolute inset-0 w-full h-full object-cover scale-[0.8] rounded-[2rem] shadow-2xl border-4 border-white/20"
                                        />

                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                                        {/* Content Overlay */}
                                        <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col items-center gap-2 z-10">
                                            <span className="font-bold text-lg text-white capitalize drop-shadow-md">{av}</span>
                                            <button
                                                onClick={(e) => playPreview(av, e)}
                                                className={`p-3 rounded-full transition-all backdrop-blur-md ${playing === av
                                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                                                    : 'bg-white/20 text-white hover:bg-white/30'
                                                    }`}
                                            >
                                                <Icons.Volume2 size={20} className={playing === av ? 'animate-pulse' : ''} />
                                            </button>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <motion.div layoutId="avatar-check" className="absolute top-3 right-3 z-20 bg-white rounded-full">
                                            <Icons.CheckCircle2 size={28} className="text-blue-600 fill-white" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Level Selector - Segmented Control */}
                <div className="glass-card p-5 rounded-3xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icons.BarChart3 size={12} /> Difficulty Level
                    </h3>

                    <div className="grid grid-cols-1 gap-1 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700">
                        {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as Level[]).map((lvl) => {
                            const isActive = settings.level === lvl;
                            return (
                                <button
                                    key={lvl}
                                    onClick={() => updateSettings({ level: lvl })}
                                    className={`relative py-2 rounded-lg font-bold text-xs transition-all z-10 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="level-active"
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md -z-10"
                                        />
                                    )}
                                    {lvl}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <span className="text-xs font-medium text-slate-500">Current Goal:</span>
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                            {settings.level === 'A1' && 'Pre-básico'}
                            {settings.level === 'A2' && 'Básico'}
                            {settings.level === 'B1' && 'Pre-Intermedio'}
                            {settings.level === 'B2' && 'Intermedio'}
                            {settings.level === 'C1' && 'Avanzado'}
                            {settings.level === 'C2' && 'Profesional'}
                        </span>
                    </div>
                </div>
            </div>

            <section>
                <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg text-white shadow-lg">
                        <Icons.MessageCircle size={20} />
                    </div>
                    Choose Your Scenario
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SCENARIOS.map((scenario, index) => {
                        const IconComponent = (Icons as any)[scenario.icon] || Icons.MessageCircle;
                        const delay = index * 0.1;

                        return (
                            <motion.button
                                key={scenario.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/session/${scenario.id}`)}
                                className="group relative glass-card p-6 rounded-[2rem] text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/50"
                            >
                                {/* 3D Depth Layer */}
                                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                                {/* Floating Badge */}
                                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full ${scenario.color} text-white font-bold text-[10px] shadow-lg shadow-black/10 z-10`}>
                                    {settings.level}
                                </div>

                                {/* Icon Pod */}
                                <div className={`inline-flex p-4 rounded-2xl ${scenario.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <IconComponent size={32} className="text-white" strokeWidth={2.5} />
                                </div>

                                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {scenario.title}
                                </h4>

                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-2">
                                    {scenario.description}
                                </p>

                                <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900/50 rounded-lg p-3 backdrop-blur-md">
                                    <Icons.User size={14} className="mr-2 text-blue-500" />
                                    Role: <span className="text-slate-700 dark:text-slate-200 ml-1">{scenario.role.split(' ').slice(0, 3).join(' ')}...</span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Home;