import { UserSettings, Scenario } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export class GroqService {

    constructor() {
        if (!GROQ_API_KEY) {
            console.warn("Groq API Key is missing. Please add VITE_GROQ_API_KEY to your .env file.");
        }
    }

    async sendChatMessage(history: { role: string; text: string }[], newMessage: string, settings: UserSettings, scenario: Scenario): Promise<string> {
        if (!GROQ_API_KEY) {
            return "Error: Missing VITE_GROQ_API_KEY. Please get a free key from console.groq.com";
        }

        const systemPrompt = `You are ${settings.teacherName}, a friendly English teacher. Roleplay as ${scenario.role} in a ${scenario.title} scenario. User level: ${settings.level}. Objective: ${scenario.objective}. Keep responses short (1-3 sentences).`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
            { role: "user", content: newMessage }
        ];

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: messages,
                    model: "llama-3.3-70b-versatile", // Or "llama3-8b-8192" for extreme speed
                    temperature: 0.7,
                    max_tokens: 150,
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("Groq API Error:", err);
                throw new Error(err.error?.message || "Groq API Error");
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "I didn't catch that.";
        } catch (e) {
            console.error("Groq Service Error:", e);
            return "Sorry, I'm having trouble connecting to Llama 3.";
        }
    }
    async translateText(text: string, targetLanguage: string = 'Spanish'): Promise<string> {
        if (!GROQ_API_KEY) return text;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: `Translate the following text to ${targetLanguage}. Return ONLY the translation, nothing else.` },
                        { role: "user", content: text }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.3,
                })
            });

            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || text;
        } catch (e) {
            console.error("Groq Translation Error:", e);
            return text;
        }
    }

    async generateFeedback(transcript: { role: string; text: string }[], scenario: Scenario): Promise<any> {
        if (!GROQ_API_KEY) return {
            score: 0,
            summary: "Groq API Key missing.",
            pronunciationAnalysis: [],
            grammarAnalysis: [],
            positivePoints: [],
            practicePhrases: []
        };

        const prompt = `
          Analyze this dialogue transcript between a user (student) and an AI (teacher roleplaying as ${scenario.role}).
          Scenario: ${scenario.title}.
          
          Transcript:
          ${transcript.map(t => `${t.role}: ${t.text}`).join('\n')}
    
          Provide structured feedback focusing ONLY on the 'user' (student) dialogue. Do NOT analyze or correct the 'model' (AI) responses.
          
          1. Identify Grammar Errors in the USER's speech: Classify them (e.g., 'Verb Tense', 'Article Usage', 'Word Choice').
          2. Analyze Pronunciation: Identify words that might have been hard for the USER based on the transcript context (or common mistakes). Specify the target phoneme (e.g. 'th' or 'v').
          4. Evaluate 5 Key Skills (0-100): Grammar, Vocabulary, Pronunciation, Fluency, Coherence.
          5. Check Mission Objectives: Based on the scenario objective "${scenario.objective}", identify 3 key sub-tasks and whether the user completed them.

          Format response as VALID JSON with this structure:
          {
            "score": number (0-100),
            "summary": "string",
            "pronunciationAnalysis": [{ "word": "string", "targetPhoneme": "string", "tip": "string" }],
            "grammarAnalysis": [{ "type": "string", "original": "string", "corrected": "string", "explanation": "string" }],
            "positivePoints": ["string"],
            "practicePhrases": ["string"],
            "skillRadar": {
              "grammar": number,
              "vocabulary": number,
              "pronunciation": number,
              "fluency": number,
              "coherence": number
            },
            "missionObjectives": [{ "objective": "string", "completed": boolean }]
          }
        `;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are an English teacher. Return only valid JSON." },
                        { role: "user", content: prompt }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.5,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            return JSON.parse(content || "{}");
        } catch (e) {
            console.error("Groq Feedback Error:", e);
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

    async generateSpeech(text: string, avatarId: 'max' | 'linda'): Promise<ArrayBuffer | null> {
        if (!GROQ_API_KEY) return null;

        // Map avatar to Groq/PlayAI voice IDs
        // Max (Male) -> Mason-PlayAI (or similar)
        // Linda (Female) -> Celeste-PlayAI (or similar)
        console.log("GroqService: Generating speech for avatar:", avatarId);
        const voiceId = (avatarId || '').toLowerCase() === 'max' ? 'Mason-PlayAI' : 'Celeste-PlayAI';
        console.log("GroqService: Selected Voice ID:", voiceId);

        try {
            const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "playai-tts",
                    input: text,
                    voice: voiceId,
                    response_format: "mp3"
                })
            });

            if (!response.ok) {
                console.error("Groq TTS Error:", await response.text());
                return null;
            }

            return await response.arrayBuffer();
        } catch (e) {
            console.error("Groq TTS Service Error:", e);
            return null;
        }
    }
}

export const groqService = new GroqService();
