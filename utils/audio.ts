export const AudioUtils = {
  // Convert Float32 audio buffer from AudioContext to Int16 PCM for Gemini
  convertFloat32ToInt16: (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  },

  // Encode Int16Array to base64 string
  encodePCMToBase64: (int16Array: Int16Array): string => {
    let binary = '';
    const bytes = new Uint8Array(int16Array.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  // Decode base64 to Float32 AudioBuffer
  decodeAudioData: async (
    base64: string,
    ctx: AudioContext,
    sampleRate: number = 24000
  ): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert to Int16 first (assuming incoming data is Int16 PCM)
    const dataInt16 = new Int16Array(bytes.buffer);
    
    // Create AudioBuffer
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Convert Int16 to Float32 for Web Audio API
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    
    return buffer;
  }
};