
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { AudioUtils } from '../utils/audio';
import { UserSettings, Scenario, FeedbackData, Level } from '../types';
import { VOICE_CONFIGS } from '../constants';

const API_KEY = process.env.API_KEY || ''; // Ensure this is available

export class GeminiService {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  // --- Translation ---
  async translateText(text: string, targetLanguage: string = 'Spanish'): Promise<string> {
    try {
        const cleanText = text.replace(/[^\w\s]/gi, ''); // Remove punctuation for better single-word translation
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Translate the English word or phrase "${cleanText}" into ${targetLanguage}. Return ONLY the translation, no extra text, no markdown.`,
        });
        return response.text?.trim() || "";
    } catch (e) {
        console.error("Translation Error:", e);
        return "Error";
    }
  }

  // --- TTS ---
  async generateSpeech(text: string, voiceName: string = 'Puck'): Promise<AudioBuffer | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      return await AudioUtils.decodeAudioData(base64Audio, audioContext);
    } catch (e) {
      console.error("TTS Error:", e);
      return null;
    }
  }

  // --- Feedback Generation ---
  async generateFeedback(transcript: string[], settings: UserSettings, scenario: Scenario): Promise<FeedbackData> {
    const prompt = `
      Analyze this dialogue transcript between a user (student) and an AI (teacher roleplaying as ${scenario.role}).
      User level: ${settings.level}.
      Scenario: ${scenario.title}.
      
      Transcript:
      ${transcript.join('\n')}

      Provide structured feedback in ${settings.feedbackLanguage}.
      
      1. Identify Grammar Errors: Classify them (e.g., 'Verb Tense', 'Article Usage', 'Word Choice'). Consider the user is level ${settings.level}, so focus on errors relevant to that stage.
      2. Analyze Pronunciation: Identify words that might have been hard based on the transcript context (or common mistakes for this level). Specify the target phoneme (e.g. 'th' or 'v').
      3. Create 3 distinct Practice Phrases that use the corrected grammar or difficult words.

      Format response as JSON.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              summary: { type: Type.STRING },
              pronunciationAnalysis: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        targetPhoneme: { type: Type.STRING },
                        tip: { type: Type.STRING }
                    }
                } 
              },
              grammarAnalysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    original: { type: Type.STRING },
                    corrected: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  }
                }
              },
              positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              practicePhrases: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });

      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (e) {
      console.error("Feedback Generation Error:", e);
      return {
        score: 0,
        summary: "Could not generate feedback.",
        pronunciationAnalysis: [],
        grammarAnalysis: [],
        positivePoints: [],
        practicePhrases: []
      };
    }
  }

  // --- Live API Connector Helper ---
  async connectLive(
    settings: UserSettings, 
    scenario: Scenario,
    callbacks: {
      onOpen: () => void,
      onMessage: (msg: LiveServerMessage) => void,
      onClose: (event: CloseEvent) => void,
      onError: (event: ErrorEvent) => void
    }
  ) {
    const voiceName = settings.avatar === 'max' ? VOICE_CONFIGS.max.live : VOICE_CONFIGS.linda.live;
    
    // CEFR Level Specific Instructions
    const levelInstructions: Record<string, string> = {
        'A1': "Speak very simply and slowly. Use basic vocabulary (Top 500 words). Short sentences (3-5 words). Avoid complex grammar. Be extremely patient and encouraging.",
        'A2': "Speak simply and clearly. Use common phrases and daily vocabulary. Sentences should be short to medium length. Avoid idiomatic expressions.",
        'B1': "Speak at a moderate pace. Use standard language. You can use some subordinate clauses but keep ideas clear. Explain complex terms if used.",
        'B2': "Speak naturally but clearly. You can use idiomatic expressions and more complex grammar. Expect the user to understand abstract ideas.",
        'C1': "Speak fluently and spontaneously. Use a broad vocabulary, complex sentence structures, and colloquialisms. Treat the user as a near-native speaker."
    };

    const specificInstruction = levelInstructions[settings.level] || levelInstructions['B1'];

    const sysInstruction = `
      You are ${settings.teacherName}, a friendly English teacher.
      However, right now, ROLEPLAY as ${scenario.role} in a ${scenario.title} scenario.
      The user is an English student at level ${settings.level}.
      Your goal is to help them achieve: "${scenario.objective}".
      
      IMPORTANT - ADJUST YOUR SPEECH TO LEVEL ${settings.level}:
      ${specificInstruction}

      Keep the conversation natural. If they make a big mistake, gently correct them in character, but prioritize flow.
      Keep your responses relatively short (1-3 sentences) unless the level requires more elaboration.
    `;

    return this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: callbacks.onOpen,
        onmessage: callbacks.onMessage,
        onclose: callbacks.onClose,
        onerror: callbacks.onError,
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        },
        systemInstruction: sysInstruction,
        inputAudioTranscription: {}, // Corrected: Empty object to enable transcription
        outputAudioTranscription: {}, // Corrected: Empty object to enable transcription
      }
    });
  }
}

export const geminiService = new GeminiService();
