
import React, { useState } from 'react';
import { FeedbackData } from '../types';
import { geminiService } from '../services/geminiService';
import { X, CheckCircle, AlertCircle, Volume2, Trophy, Star, Mic, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  data: FeedbackData;
  scenarioTitle: string;
  onClose: () => void;
}

const FeedbackModal: React.FC<Props> = ({ data, scenarioTitle, onClose }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const playAudio = async (text: string, id: string) => {
    if (playingId) return;
    setPlayingId(id);
    try {
      const buffer = await geminiService.generateSpeech(text);
      if (buffer) {
        const ctx = new AudioContext();
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        source.onended = () => setPlayingId(null);
      } else {
          setPlayingId(null);
      }
    } catch (e) {
      setPlayingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Session Report</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{scenarioTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Score Card */}
            <div className="flex items-center gap-6 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-800 p-6 rounded-2xl text-white shadow-lg">
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeOpacity="0.2" strokeWidth="8" fill="none" />
                        <circle cx="48" cy="48" r="40" stroke="white" strokeWidth="8" fill="none" 
                                strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * data.score) / 100} 
                                className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold">{data.score}</span>
                        <span className="text-xs opacity-80">SCORE</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                        {data.score >= 90 ? 'Excellent!' : data.score >= 70 ? 'Great Job!' : 'Good Practice'}
                    </h3>
                    <p className="text-blue-100 text-sm leading-relaxed">{data.summary}</p>
                </div>
            </div>

            {/* Main Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Grammar Analysis */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <AlertCircle size={16} /> Grammar Insights
                    </h4>
                    {data.grammarAnalysis.length > 0 ? (
                        <div className="space-y-3">
                            {data.grammarAnalysis.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400 line-through text-sm mb-1">{item.original}</div>
                                    <div className="text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                                        {item.corrected}
                                        <button 
                                            onClick={() => playAudio(item.corrected, `gram-${idx}`)}
                                            className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${playingId === `gram-${idx}` ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`}
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-500 text-xs mt-2 italic border-t border-slate-200 dark:border-slate-700 pt-2">{item.explanation}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm italic py-4">No major grammar errors detected. Good job!</div>
                    )}
                </div>

                {/* Pronunciation Analysis */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <Mic size={16} /> Pronunciation Focus
                    </h4>
                    {data.pronunciationAnalysis.length > 0 ? (
                        <div className="space-y-3">
                            {data.pronunciationAnalysis.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                                        {item.targetPhoneme}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            {item.word}
                                            <button 
                                                onClick={() => playAudio(item.word, `pron-${idx}`)}
                                                className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${playingId === `pron-${idx}` ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`}
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                        </div>
                                        <div className="text-xs text-slate-500">{item.tip}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm italic py-4">Your pronunciation was clear throughout!</div>
                    )}

                    {/* Strengths */}
                    <div className="mt-6">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <CheckCircle size={16} /> Key Strengths
                        </h4>
                        <ul className="space-y-2">
                            {data.positivePoints.slice(0, 3).map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <Star size={14} className="text-yellow-500 mt-1 shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Practice Zone */}
            {data.practicePhrases && data.practicePhrases.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                        <Trophy size={20} className="text-indigo-500" /> Practice Zone
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {data.practicePhrases.map((phrase, idx) => (
                            <div key={idx} className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl flex items-center justify-between shadow-sm">
                                <span className="text-slate-700 dark:text-slate-200 font-medium">{phrase}</span>
                                <button 
                                    onClick={() => playAudio(phrase, `prac-${idx}`)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                        playingId === `prac-${idx}` 
                                        ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500 ring-opacity-50' 
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300'
                                    }`}
                                >
                                    <Volume2 size={16} /> Listen
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <button 
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
                Complete Session <ArrowRight size={20} />
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackModal;
