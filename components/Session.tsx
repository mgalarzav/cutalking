import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { SCENARIOS, API_URL } from '../constants';
import { groqService } from '../services/groqService';
import { deepgramService } from '../services/deepgramService';
import { Mic, PhoneOff, ArrowLeft, Sparkles, Loader2, MessageSquare, Volume2, RefreshCw } from 'lucide-react';
import { Avatar3D } from './Avatar3D';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackData, AppStatus } from '../types';
import FeedbackModal from './FeedbackModal';

// --- Sub-components ---

const InteractiveMessage: React.FC<{ text: string; role: 'user' | 'model' }> = ({ text, role }) => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

  const words = text.split(' ');

  const handleWordClick = async (word: string, index: number) => {
    // Remove punctuation for translation
    const cleanWord = word.replace(/[.,!?;:()]/g, '');
    if (!cleanWord) return;

    if (selectedWordIndex === index) {
      setSelectedWordIndex(null);
      setTranslation(null);
      return;
    }

    setSelectedWordIndex(index);
    setLoading(true);
    setTranslation(null);

    const translated = await groqService.translateText(word);
    setTranslation(translated);
    setLoading(false);
  };

  return (
    <div className="relative">
      {words.map((word, index) => (
        <span
          key={index}
          onClick={() => handleWordClick(word, index)}
          className={`relative inline-block rounded px-0.5 transition-colors cursor-pointer select-none ${word.trim() ? 'hover:bg-white/20' : ''
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
  const { settings, updateStats, stats, user } = useContext(AppContext);

  // Robustly find scenario, defaulting to first one if not found to prevent crashes
  const foundScenario = SCENARIOS.find(s => s.id === scenarioId);
  const scenario = foundScenario || SCENARIOS[0];

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [transcripts, setTranscripts] = useState<{ role: string; text: string }[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ttsProvider, setTtsProvider] = useState<'G' | 'D' | null>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);

  // Classic Mode Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // State Ref to prevent stale closures
  const transcriptsRef = useRef<{ role: string; text: string }[]>([]);
  const isEndingRef = useRef(false); // Flag to strictly block processing when ending

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Helper Functions ---

  const stopAudioProcessing = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    setIsAiSpeaking(false);
    setIsListening(false);
    setIsProcessing(false);
  };

  const stopClassicMode = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent restart loop
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    synthesisRef.current.cancel();
    setIsAiSpeaking(false);
    setIsListening(false);
    setIsProcessing(false);
  };

  const endSession = async () => {
    isEndingRef.current = true; // Ensure flag is set

    // Scenario is guaranteed to be defined now due to fallback
    if (status === AppStatus.IDLE && !errorMsg) return;
    stopAudioProcessing();
    stopClassicMode();

    if (status === AppStatus.ERROR) {
      setStatus(AppStatus.IDLE);
      setErrorMsg(null);
      return;
    }

    // Generate feedback using REF to avoid stale state
    const currentTranscripts = transcriptsRef.current;

    if (currentTranscripts.length === 0) {
      setErrorMsg("No conversation to analyze yet.");
      setStatus(AppStatus.IDLE);
      return;
    }

    setStatus(AppStatus.PROCESSING_FEEDBACK);
    try {
      const feedbackData = await groqService.generateFeedback(currentTranscripts, scenario!, settings.level);

      if (feedbackData.score === 0 && feedbackData.summary === "Could not generate feedback.") {
        setStatus(AppStatus.IDLE);
        setErrorMsg("Failed to generate feedback. Please try again.");
        return;
      }

      setFeedback(feedbackData);

      // Persist stars and progress to DB if user is logged in
      if (user && user.id) {
        try {
          const token = localStorage.getItem('token');

          // 1. Update Scenario Progress
          const turns = currentTranscripts.length;
          let progress = 0;
          if (turns >= 6) progress = 100;
          else if (turns >= 3) progress = 25;

          if (progress > 0) {
            await fetch(`${API_URL}/api/progress`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ scenario_id: scenario!.id, progress })
            });
          }

          // 2. Sync Stars from Backend (Source of Truth)
          const syncResponse = await fetch(`${API_URL}/api/users/${user.id}/sync-stars`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            const newStars = syncData.stars;

            // Update local stats
            updateStats({
              xp: stats.xp + 50 + (feedbackData.score > 80 ? 20 : 0),
              dialoguesCompleted: stats.dialoguesCompleted + (progress === 100 ? 1 : 0),
              stars: newStars
            });

            // Update local storage user
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (storedUser) {
              storedUser.stars = newStars;
              localStorage.setItem('user', JSON.stringify(storedUser));
            }
          }

        } catch (err) {
          console.error("Failed to save stats/progress", err);
        }
      } else {
        // Guest mode fallback
        const newStars = (stats.stars || 0) + 1;
        updateStats({
          xp: stats.xp + 50 + (feedbackData.score > 80 ? 20 : 0),
          dialoguesCompleted: stats.dialoguesCompleted + 1,
          stars: newStars
        });
      }

      setStatus(AppStatus.FEEDBACK_READY);
    } catch (e) {
      console.error(e);
      setStatus(AppStatus.IDLE);
      setErrorMsg("Failed to generate feedback. Please try again.");
    }
  };

  const checkFarewell = (text: string) => {
    if (isEndingRef.current) return; // Already ending

    const farewells = ['bye', 'goodbye', 'see you', 'have a nice day', 'adios', 'hasta luego', 'good night'];
    const lower = text.toLowerCase();
    if (farewells.some(w => lower.includes(w))) {
      console.log('Farewell detected, ending session immediately...');
      isEndingRef.current = true; // Set flag immediately
      stopAudioProcessing(); // Kill audio immediately
      stopClassicMode();
      endSession();
    }
  };

  // --- Effects ---

  useEffect(() => {
    if (!foundScenario) {
      console.warn(`Scenario ID "${scenarioId}" not found. Defaulting to "${SCENARIOS[0].title}"`);
    }
    // Initialize Audio Context for playback
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    return () => {
      stopAudioProcessing();
      stopClassicMode();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
    // Update Ref whenever state changes
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  useEffect(() => {
    if (errorMsg) console.log("UI Error Message Displayed:", errorMsg);
  }, [errorMsg]);

  // --- Handlers ---

  const restartRecognition = () => {
    if (isEndingRef.current) return;

    // Safety check: if already listening, don't restart
    if (isListening && recognitionRef.current) return;

    console.log("Attempting to restart recognition...");

    try {
      if (recognitionRef.current) {
        // If it exists but we need to restart, stop it first
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    } catch (e) {
      console.warn("Error stopping previous recognition:", e);
    }

    // Small delay to ensure clean state
    setTimeout(() => {
      startClassicSession();
    }, 100);
  };

  const startClassicSession = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setErrorMsg("Your browser does not support Speech Recognition. Please use Chrome.");
      return;
    }

    // Ensure AudioContext is running
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume().catch(console.error);
    }

    setStatus(AppStatus.ACTIVE);
    setErrorMsg(null);
    isEndingRef.current = false;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log("Classic Recognition Started");
      setIsListening(true);
      setIsProcessing(false);
      setIsAiSpeaking(false);
    };

    recognition.onresult = async (event: any) => {
      if (isEndingRef.current || isAiSpeaking || isProcessing) return;

      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const text = lastResult[0].transcript;
        console.log("Classic User Transcript:", text);

        // Add User Transcript
        setTranscripts(prev => [...prev, { role: 'user', text }]);
        checkFarewell(text);

        if (isEndingRef.current) return;

        // Stop listening while AI thinks/speaks
        recognition.stop();
        setIsListening(false);
        setIsProcessing(true);

        // Get AI Response
        let responseText = "";
        try {
          responseText = await groqService.sendChatMessage(transcriptsRef.current, text, settings, scenario!);
        } catch (e) {
          console.error("AI Generation Error", e);
          responseText = "Sorry, I had a glitch.";
        }

        // Add AI Transcript
        setTranscripts(prev => [...prev, { role: 'model', text: responseText }]);
        checkFarewell(responseText);

        if (isEndingRef.current) return;

        // Speak AI Response
        setIsProcessing(false);
        setIsAiSpeaking(true);

        try {
          // Use Groq TTS
          console.log("Session: Requesting Groq TTS for avatar:", settings.avatar);
          let audioBuffer = await groqService.generateSpeech(responseText, settings.avatar);
          if (audioBuffer) setTtsProvider('G');

          // Fallback to Deepgram
          if (!audioBuffer) {
            console.warn("Groq TTS failed, attempting Deepgram fallback...");
            audioBuffer = await deepgramService.generateSpeech(responseText, settings.avatar);
            if (audioBuffer) setTtsProvider('D');
          }

          if (audioBuffer && audioContextRef.current) {
            // Play Audio
            const ctx = audioContextRef.current;
            const decodedBuffer = await ctx.decodeAudioData(audioBuffer);
            const source = ctx.createBufferSource();
            source.buffer = decodedBuffer;
            source.connect(ctx.destination);

            source.start(0);

            source.onended = () => {
              console.log("Audio ended, restarting recognition...");
              setIsAiSpeaking(false);
              if (!isEndingRef.current) {
                restartRecognition();
              }
            };
          } else {
            console.error("All TTS services failed or AudioContext missing. Skipping speech.");
            setIsAiSpeaking(false);
            setErrorMsg(null); // Ensure no error lingers
            if (!isEndingRef.current) {
              restartRecognition();
            }
          }
        } catch (e) {
          console.error("TTS Error:", e);
          setIsAiSpeaking(false);
          setErrorMsg(null); // Ensure no error lingers
          // Attempt restart on error
          if (!isEndingRef.current) {
            restartRecognition();
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Classic Recognition Error:", event.error);
      // Only show error for permission issues, ignore others to prevent flashing
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setErrorMsg("Microphone access denied. Please check permissions.");
        setStatus(AppStatus.ERROR);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if not ending, not speaking, and not processing
      if (!isEndingRef.current && !isAiSpeaking && !isProcessing && status === AppStatus.ACTIVE) {
        console.log("Recognition ended unexpectedly, restarting...");
        restartRecognition();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startSession = async () => {
    // Explicitly resume audio context on user interaction
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (e) {
        console.error("Failed to resume audio context", e);
      }
    }
    // Reset transcripts only on fresh start
    setTranscripts([]);
    transcriptsRef.current = [];
    startClassicSession();
  };

  const isActive = status !== AppStatus.IDLE && status !== AppStatus.ERROR && status !== AppStatus.FEEDBACK_READY;
  const isStuck = isActive && !isListening && !isAiSpeaking && !isProcessing;

  return (
    <div className="h-full flex flex-col items-center justify-between py-2 max-w-2xl mx-auto relative px-4">

      {/* Session Header */}
      <div className="w-full flex-none flex items-center justify-between mb-4 z-20 glass p-3 rounded-full shadow-sm">
        <button onClick={() => { stopAudioProcessing(); stopClassicMode(); navigate('/'); }} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">{scenario?.title}</h2>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : isAiSpeaking ? 'bg-blue-500' : 'bg-slate-400'}`} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isListening ? 'Listening...' : isAiSpeaking ? 'Speaking...' : isProcessing ? 'Thinking...' : status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ttsProvider && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${ttsProvider === 'G' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
              {ttsProvider}
            </span>
          )}
          <button onClick={() => { stopAudioProcessing(); stopClassicMode(); endSession(); }} className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors" title="End Session">
            <PhoneOff size={20} />
          </button>
        </div>
      </div>

      {/* Avatar Container */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 relative">
        <div className="relative w-full max-w-[168px] aspect-square flex items-center justify-center mb-4">

          {/* Speaking Pulse Animation */}
          {isAiSpeaking && (
            <>
              {/* Core Glow - Intense & Fast */}
              <motion.div
                animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-500/40 rounded-full blur-xl z-0"
              />

              {/* Ripple 1 - Wide & Soft */}
              <motion.div
                initial={{ opacity: 0.6, scale: 0.9 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 bg-blue-400/20 rounded-full z-0"
              />

              {/* Ripple 2 - Delayed & Sharp */}
              <motion.div
                initial={{ opacity: 0.6, scale: 0.9 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 border-2 border-blue-300/40 rounded-full z-0"
              />

              {/* Ripple 3 - Outer Echo */}
              <motion.div
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: [0, 0.3, 0], scale: 2.2 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1 }}
                className="absolute inset-0 border border-indigo-400/20 rounded-full z-0"
              />
            </>
          )}

          {/* Base Glow */}
          <div className={`absolute inset-0 bg-blue-500/20 rounded-full blur-3xl transition-all duration-500 ${isAiSpeaking ? 'opacity-80 scale-110' : 'opacity-30 scale-90'}`} />

          <div className="w-full h-full relative z-10">
            <Avatar3D isSpeaking={isAiSpeaking} />
          </div>
        </div>

        {/* Floating Glass Chat Overlay */}
        <div
          ref={scrollRef}
          className="w-full max-h-[35vh] overflow-y-auto space-y-4 px-2 py-2 mask-image-t scroll-smooth pb-4 shrink-0"
        >
          <AnimatePresence initial={false}>
            {isActive && transcripts.length === 0 && (
              <motion.div
                key="start-prompt"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="flex flex-col items-center justify-center py-10 text-center space-y-4"
              >
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-3xl shadow-2xl border-4 border-white/20 backdrop-blur-xl flex items-center gap-3 animate-[pulse_3s_ease-in-out_infinite]">
                  <MessageSquare size={24} className="animate-bounce" />
                  <span className="font-extrabold text-lg tracking-wide">It's your turn! Start the conversation</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium bg-white/50 dark:bg-slate-800/50 px-4 py-1 rounded-full">
                  Microphone is active 🎙️
                </p>
              </motion.div>
            )}

            {transcripts.slice(-8).map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-xl backdrop-blur-md border ${t.role === 'user'
                  ? 'bg-blue-600/90 text-white rounded-br-none border-blue-500/50'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-bl-none border-white/50 dark:border-slate-600'
                  }`}>
                  <InteractiveMessage text={t.text} role={t.role as 'user' | 'model'} />
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl px-4 py-2 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-slate-500" />
                  <span className="text-xs text-slate-500">Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Controls */}
      <div className="w-full mt-4 flex flex-col items-center justify-center z-20 pb-6 flex-none gap-4">
        {!isActive && (
          <div className="flex gap-4">
            <button
              key="start"
              onClick={() => { startSession(); }}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/40 border-4 border-white dark:border-slate-800 hover:scale-105 active:scale-95 transition-transform"
              title="Start Session"
            >
              <Mic size={32} className="text-white fill-white" />
            </button>
          </div>
        )}

        {/* Manual Resume Button if Stuck */}
        {isStuck && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={restartRecognition}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 text-white font-bold shadow-lg hover:bg-orange-600 transition-colors"
          >
            <RefreshCw size={20} /> Resume Conversation
          </motion.button>
        )}
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-20 bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl z-50 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
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