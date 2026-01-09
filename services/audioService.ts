
import { GoogleGenAI, Modality } from "@google/genai";

export const audioService = {
  audioContext: null as AudioContext | null,

  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return this.audioContext;
  },

  /**
   * تحويل النص إلى صوت وتشغيله
   */
  async speak(text: string, onEnded?: () => void) {
    // Fix: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY`
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = this.getAudioContext();
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }
        
        const buffer = ctx.createBuffer(1, bytes.length / 2, 24000);
        const dataInt16 = new Int16Array(bytes.buffer);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) { channelData[i] = dataInt16[i] / 32768.0; }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        if (onEnded) source.onended = onEnded;
        source.start();
        return source;
      }
    } catch (e) {
      console.error("Audio Service Error:", e);
    }
    return null;
  }
};