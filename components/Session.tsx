import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { SCENARIOS } from '../constants';
import { geminiService } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { Mic, PhoneOff, ArrowLeft, Volume2, Sparkles, Loader2, X } from 'lucide-react';
import { AudioUtils } from '../utils/audio';
import { AppStatus, FeedbackData } from '../types';
import FeedbackModal from './FeedbackModal';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-Components ---

const Avatar3D: React.FC<{ 
  avatarId: string; 
  isAiSpeaking: boolean; 
  userVolume: number; 
  status: AppStatus;
}> = ({ avatarId, isAiSpeaking, userVolume, status }) => {
  const isMax = avatarId === 'max';
  
  // Gradients for the 3D Sphere
  const maxGradient = "radial-gradient(circle at 35% 35%, #67e8f9, #06b6d4, #155e75)";
  const lindaGradient = "radial-gradient(circle at 35% 35%, #f0abfc, #d946ef, #86198f)";
  
  const currentGradient = isMax ? maxGradient : lindaGradient;

  return (
    <div className="relative flex items-center justify-center w-80 h-80 perspective-1000">
      
      {/* 1. Connection Loader Ring */}
      <AnimatePresence>
        {status === AppStatus.CONNECTING && (
            <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 rounded-full border-4 border-dashed ${isMax ? 'border-cyan-400/50' : 'border-fuchsia-400/50'}`}
            />
        )}
      </AnimatePresence>

      {/* 2. Outer Glow / Atmosphere */}
      <motion.div 
        animate={{
            scale: isAiSpeaking ? [1, 1.2, 1] : 1,
            opacity: isAiSpeaking ? 0.6 : 0.2
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-4 rounded-full blur-2xl ${isMax ? 'bg-cyan-500' : 'bg-fuchsia-500'}`}
      />

      {/* 3. The 3D Sphere */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
            scale: 1,
            y: status === AppStatus.ACTIVE ? [0, -10, 0] : 0 
        }}
        transition={{ 
            scale: { type: "spring", stiffness: 200, damping: 20 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ background: currentGradient }}
        className="w-48 h-48 rounded-full relative z-20 orb-shadow flex items-center justify-center overflow-hidden"
      >
        {/* Shine highlight */}
        <div className="absolute top-4 left-6 w-16 h-8 bg-white/40 blur-lg rounded-full transform -rotate-45" />

        {/* Inner Core Pulse */}
        <motion.div
            animate={{
                scale: isAiSpeaking ? [1, 1.1, 1] : 1,
                opacity: isAiSpeaking ? [0.8, 1, 0.8] : 0.5
            }}
            transition={{ duration: 0.5, repeat: isAiSpeaking ? Infinity : 0 }}
            className="w-full h-full rounded-full mix-blend-overlay bg-white/20"
        />

        {/* Waveform Visualization (Inside the Sphere) */}
        {isAiSpeaking && (
           <div className="absolute inset-0 flex items-center justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [10, 60, 10] }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    delay: i * 0.1,
                    ease: "easeInOut" 
                  }}
                  className="w-2 bg-white/80 rounded-full shadow-lg"
                />
              ))}
           </div>
        )}

        {/* User Speaking Reaction (Core Glow) */}
        {!isAiSpeaking && userVolume > 0.05 && (
            <motion.div 
                className="absolute inset-0 bg-white/30"
                animate={{ opacity: Math.min(userVolume * 5, 0.8) }}
            />
        )}
      </motion.div>
      
      {/* 4. Floor Reflection/Shadow */}
      <div className="absolute -bottom-10 w-32 h-4 bg-black/20 blur-xl rounded-[100%]" />

      {/* 5. Emitting Rings (Radar) */}
      {isAiSpeaking && (
         <>
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    className={`absolute border ${isMax ? 'border-cyan-400' : 'border-fuchsia-400'} rounded-full`}
                    initial={{ width: '12rem', height: '12rem', opacity: 0.8, borderWidth: 2 }}
                    animate={{ width: '24rem', height: '24rem', opacity: 0, borderWidth: 0 }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                />
            ))}
         </>
      )}
    </div>
  );
};

const InteractiveMessage: React.FC<{ text: string; role: 'user' | 'model' }> = ({ text, role }) => {
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Split text by spaces but keep delimiters to preserve sentence structure
  const words = text.split(/(\s+)/);

  const handleWordClick = async (word: string, index: number) => {
    // Ignore whitespace or empty strings
    if (!word.trim()) return;

    if (selectedWordIndex === index) {
        setSelectedWordIndex(null);
        setTranslation(null);
        return;
    }

    setSelectedWordIndex(index);
    setLoading(true);
    setTranslation(null);

    const translated = await geminiService.translateText(word);
    setTranslation(translated);
    setLoading(false);
  };

  return (
    <div className="relative">
      {words.map((word, index) => (
        <span 
            key={index}
            onClick={() => handleWordClick(word, index)}
            className={`relative inline-block rounded px-0.5 transition-colors cursor-pointer select-none ${
                word.trim() ? 'hover:bg-white/20' : ''
            }`}
        >
            {word}
            
            {/* Translation Tooltip */}
            <AnimatePresence>
                {selectedWordIndex === index && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -30, scale: 1 }}
                        exit={{ opacity: 0, y: 0, scale: 0.9 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 z-50 whitespace-nowrap"
                    >
                         <div className="glass px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white bg-white/90 dark:bg-slate-800/90 border border-white/20">
                            {loading ? (
                                <Loader2 size={12} className="animate-spin text-blue-500" />
                            ) : (
                                <>
                                    <Sparkles size={10} className="text-yellow-500" />
                                    {translation}
                                </>
                            )}
                            {/* Tiny Triangle Pointer */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/90 dark:border-t-slate-800/90" />
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
      ))}
    </div>
  );
};


// --- Main Session Component ---

const Session: React.FC = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const { settings, updateStats, stats } = useContext(AppContext);
  const scenario = SCENARIOS.find(s => s.id === scenarioId);

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [transcripts, setTranscripts] = useState<{ role: string; text: string }[]>([]);
  const [volume, setVolume] = useState<number>(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isErrorRef = useRef(false);

  useEffect(() => {
    if (!scenario) {
      navigate('/');
      return;
    }
    return () => {
      stopAudioProcessing();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [transcripts]);

  const handleServerMessage = async (message: LiveServerMessage) => {
    const { serverContent } = message;
    if (!serverContent) return;

    // Audio Output
    const base64Audio = serverContent.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && audioContextRef.current) {
        setIsAiSpeaking(true);
        const ctx = audioContextRef.current;
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
        
        try {
          const audioBuffer = await AudioUtils.decodeAudioData(base64Audio, ctx);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += audioBuffer.duration;
          
          sourcesRef.current.add(source);
          source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
          };
        } catch(e) { console.error(e); }
    }

    if (serverContent.interrupted) {
      sourcesRef.current.forEach(source => source.stop());
      sourcesRef.current.clear();
      nextStartTimeRef.current = 0;
      setIsAiSpeaking(false);
    }

    // Transcription
    if (serverContent.inputTranscription?.text) {
        const text = serverContent.inputTranscription.text;
        setTranscripts(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'user') {
                return [...prev.slice(0, -1), { ...last, text: last.text + text }];
            }
            return [...prev, { role: 'user', text }];
        });
    }

    if (serverContent.outputTranscription?.text) {
        const text = serverContent.outputTranscription.text;
        setTranscripts(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'model') {
                return [...prev.slice(0, -1), { ...last, text: last.text + text }];
            }
            return [...prev, { role: 'model', text }];
        });
    }
  };

  const stopAudioProcessing = () => {
    if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (inputContextRef.current) { inputContextRef.current.close().catch(console.error); inputContextRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close().catch(console.error); audioContextRef.current = null; }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  const startSession = async () => {
    setErrorMsg(null);
    setStatus(AppStatus.CONNECTING);
    setTranscripts([]);
    setFeedback(null);
    isErrorRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      await inputContextRef.current.resume();
      await audioContextRef.current.resume();

      sessionPromiseRef.current = geminiService.connectLive(settings, scenario!, {
        onOpen: () => {
          setStatus(AppStatus.ACTIVE);
          startAudioInput();
        },
        onMessage: handleServerMessage,
        onClose: () => {
          if (!isErrorRef.current) {
            setStatus(prev => (prev === AppStatus.PROCESSING_FEEDBACK || prev === AppStatus.FEEDBACK_READY) ? prev : AppStatus.IDLE);
          }
        },
        onError: (e) => {
          isErrorRef.current = true;
          stopAudioProcessing();
          setErrorMsg("Connection error. Please try again.");
          setStatus(AppStatus.ERROR);
        }
      });

    } catch (err) {
      isErrorRef.current = true;
      stopAudioProcessing();
      setErrorMsg("Microphone permission denied.");
      setStatus(AppStatus.ERROR);
    }
  };

  const startAudioInput = () => {
    if (!inputContextRef.current || !streamRef.current || !sessionPromiseRef.current) return;
    const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
    const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
    scriptProcessorRef.current = processor;

    processor.onaudioprocess = (e) => {
      try {
        if (isErrorRef.current || status === AppStatus.ERROR) return;
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
        setVolume(sum / inputData.length);

        const pcmInt16 = AudioUtils.convertFloat32ToInt16(inputData);
        const base64Data = AudioUtils.encodePCMToBase64(pcmInt16);

        sessionPromiseRef.current?.then(session => {
            session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64Data } });
        }).catch(() => {});
      } catch (err) {}
    };
    source.connect(processor);
    processor.connect(inputContextRef.current.destination);
  };

  const endSession = async () => {
    if (status === AppStatus.IDLE && !errorMsg) return;
    stopAudioProcessing();
    if (status === AppStatus.ERROR) {
        setStatus(AppStatus.IDLE);
        setErrorMsg(null);
        return;
    }

    setStatus(AppStatus.PROCESSING_FEEDBACK);
    const transcriptText = transcripts.map(t => `${t.role.toUpperCase()}: ${t.text}`);
    if (transcriptText.length > 0) {
        const feedbackData = await geminiService.generateFeedback(transcriptText, settings, scenario!);
        setFeedback(feedbackData);
        updateStats({
            xp: stats.xp + 50 + (feedbackData.score > 80 ? 20 : 0),
            dialoguesCompleted: stats.dialoguesCompleted + 1
        });
        setStatus(AppStatus.FEEDBACK_READY);
    } else {
        setStatus(AppStatus.IDLE);
        navigate('/');
    }
  };

  const isActive = status !== AppStatus.IDLE && status !== AppStatus.ERROR && status !== AppStatus.FEEDBACK_READY;

  return (
    <div className="h-full flex flex-col items-center justify-between py-2 max-w-2xl mx-auto relative px-4">
      
      {/* Session Header */}
      <div className="w-full flex-none flex items-center justify-between mb-4 z-20 glass p-3 rounded-full shadow-sm">
        <button onClick={() => { stopAudioProcessing(); navigate('/'); }} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex flex-col items-center">
            <h2 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 text-sm truncate max-w-[150px]">{scenario?.title}</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{settings.level}</span>
                <span>•</span>
                <span>{settings.avatar}</span>
            </div>
        </div>
        {/* Force Exit Button */}
        <button 
            onClick={() => { stopAudioProcessing(); navigate('/'); }} 
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
            title="Cancel Call"
        >
            <X size={20} />
        </button>
      </div>

      {/* 3D Scene Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative perspective-container min-h-0">
        
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[250px]">
            <Avatar3D 
                avatarId={settings.avatar} 
                isAiSpeaking={isAiSpeaking} 
                userVolume={volume} 
                status={status}
            />
            
            <div className="mt-8 h-8 flex items-center justify-center">
               {status === AppStatus.PROCESSING_FEEDBACK && (
                   <span className="glass px-4 py-2 rounded-full text-blue-500 flex items-center gap-2 text-sm font-bold shadow-lg animate-pulse">
                       <Loader2 className="animate-spin" size={16} /> Analysis in progress...
                   </span>
               )}
               {status === AppStatus.ACTIVE && isAiSpeaking && (
                   <span className={`glass px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 ${settings.avatar === 'max' ? 'text-cyan-600' : 'text-fuchsia-600'}`}>
                      <Volume2 size={16} className="animate-pulse" /> 
                      {settings.avatar === 'max' ? 'Max' : 'Linda'} is speaking...
                   </span>
               )}
               {status === AppStatus.ACTIVE && !isAiSpeaking && volume < 0.02 && (
                   <span className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-bounce">Listening...</span>
               )}
            </div>
        </div>

        {/* Floating Glass Chat Overlay */}
        <div 
            ref={scrollRef}
            className="w-full max-h-[35vh] overflow-y-auto space-y-4 px-2 py-2 mask-image-t scroll-smooth pb-4 shrink-0"
        >
            <AnimatePresence initial={false}>
                {transcripts.slice(-8).map((t, idx) => ( 
                    <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-xl backdrop-blur-md border ${
                            t.role === 'user' 
                            ? 'bg-blue-600/90 text-white rounded-br-none border-blue-500/50' 
                            : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-bl-none border-white/50 dark:border-slate-600'
                        }`}>
                            <InteractiveMessage text={t.text} role={t.role as 'user' | 'model'} />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>

      {/* Modern Controls */}
      <div className="w-full mt-4 flex justify-center z-20 pb-6 flex-none">
        {isActive ? (
            <button 
                key="stop"
                onClick={endSession}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-red-500/40 border-4 border-white dark:border-slate-800 hover:scale-105 active:scale-95 transition-transform"
                title="End Call"
            >
                <PhoneOff size={32} className="text-white fill-white" />
            </button>
        ) : (
            <button 
                key="start"
                onClick={startSession}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/40 border-4 border-white dark:border-slate-800 hover:scale-105 active:scale-95 transition-transform"
                title="Start Call"
            >
                <Mic size={32} className="text-white fill-white" />
            </button>
        )}
      </div>

      {/* Error Toast */}
      <AnimatePresence>
          {errorMsg && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-20 bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl z-50 flex items-center gap-2"
            >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"/>
                {errorMsg}
            </motion.div>
          )}
      </AnimatePresence>

      {status === AppStatus.FEEDBACK_READY && feedback && (
          <FeedbackModal 
            data={feedback} 
            onClose={() => { setFeedback(null); navigate('/'); }} 
            scenarioTitle={scenario?.title || 'Session'}
          />
      )}
    </div>
  );
};

export default Session;