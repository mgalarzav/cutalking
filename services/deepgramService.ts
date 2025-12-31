
const DEEPGRAM_API_KEY = 'a37c3591bb68c26ede2c7faaecce311734a621ca';

export class DeepgramService {
    async generateSpeech(text: string, avatarId: 'max' | 'linda'): Promise<ArrayBuffer | null> {
        if (!DEEPGRAM_API_KEY) {
            console.error("Deepgram API Key is missing.");
            return null;
        }

        // Map avatar to Deepgram Aura voices
        // Max (Male) -> aura-orion-en (Male) or aura-arcas-en
        // Linda (Female) -> aura-asteria-en (Female) or aura-luna-en
        const model = (avatarId || '').toLowerCase() === 'max' ? 'aura-orion-en' : 'aura-asteria-en';

        console.log(`DeepgramService: Generating speech for ${avatarId} using model ${model}`);

        try {
            const response = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${DEEPGRAM_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Deepgram API Error:", response.status, errorText);
                return null;
            }

            return await response.arrayBuffer();
        } catch (error) {
            console.error("Deepgram Service Error:", error);
            return null;
        }
    }
}

export const deepgramService = new DeepgramService();
