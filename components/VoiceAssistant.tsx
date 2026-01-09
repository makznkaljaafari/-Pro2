
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { useApp } from '../context/AppContext';
import { aiTools } from '../services/geminiService';

interface PendingVoiceAction {
  name: string;
  args: any;
  toolCallId: string;
}

const VoiceAssistant: React.FC = () => {
  const { 
    customers, suppliers, sales, vouchers, 
    addSale, addPurchase, addVoucher, addNotification 
  } = useApp();

  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusText, setStatusText] = useState('تحدث معي...');
  const [transcription, setTranscription] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingVoiceAction | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleToolCall = (call: any) => {
    setPendingAction({
      name: call.name,
      args: call.args,
      toolCallId: call.id
    });
    setStatusText('في انتظار تأكيدك...');
    return { status: "Awaiting user confirmation on screen" };
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { name, args } = pendingAction;
    
    try {
      if (name === 'recordSale') {
        const customer = customers.find(c => c.name.includes(args.customer_name)) || customers[0];
        addSale({ ...args, customer_id: customer.id, customer_name: customer.name, total: args.quantity * args.unit_price, notes: 'أمر صوتي' });
      } else if (name === 'recordVoucher') {
        const person = args.person_type === 'عميل' ? customers.find(c => c.name.includes(args.person_name)) : suppliers.find(s => s.name.includes(args.person_name));
        if (person) addVoucher({ ...args, person_id: person.id, person_name: person.name });
      }
      addNotification("تم بنجاح ✅", "تم تنفيذ الأمر الصوتي بعد تأكيدك.", "success");
    } catch (e) {}

    setPendingAction(null);
    setStatusText('تحدث معي...');
  };

  const startSession = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setIsActive(true);
    setStatusText('جاري الربط...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setStatusText('أنا أسمعك، تفضل...');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) setTranscription(prev => prev + msg.serverContent!.outputTranscription!.text);
            
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                const res = handleToolCall(fc);
                sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: res } }));
              }
            }

            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.push(source);
            }

            if (msg.serverContent?.turnComplete) {
              setTranscription('');
            }
          },
          onerror: () => setIsActive(false),
          onclose: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: aiTools }],
          outputAudioTranscription: {},
          systemInstruction: "أنت المساعد الصوتي لوكالة الشويع. عند طلب عملية مالية، أخبر المستخدم أنك جهزت البيانات للتأكيد على الشاشة."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsActive(false);
      setIsConnecting(false);
    }
  };

  const closeSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    setIsActive(false);
  };

  return (
    <>
      <button 
        onClick={isActive ? closeSession : startSession}
        className={`fixed bottom-32 left-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-[60] transition-all duration-500 ${
          isActive ? 'bg-red-600 rotate-45' : 'bg-gradient-to-br from-emerald-500 to-teal-700 animate-border-pulse'
        }`}
      >
        {isActive ? <span className="text-white text-3xl">✕</span> : <span className="text-white text-3xl">🎙️</span>}
      </button>

      {isActive && (
        <div className="fixed inset-0 z-[55] flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md flex flex-col items-center gap-10 text-center">
            <div className="relative">
              <div className={`w-40 h-40 bg-emerald-500 rounded-full flex items-center justify-center text-6xl shadow-2xl ${isConnecting ? 'animate-pulse' : 'animate-logo-float'}`}>🤖</div>
              <div className="absolute inset-0 border-4 border-emerald-400/20 rounded-full animate-ping"></div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">{statusText}</h2>
              <p className="text-emerald-400 font-bold min-h-[1.5rem] italic">{transcription}</p>
            </div>

            {pendingAction && (
              <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border-4 border-emerald-500 animate-in zoom-in-95">
                <h3 className="text-xl font-black mb-4 dark:text-white">تأكيد الأمر الصوتي ⚡</h3>
                <p className="text-sm font-bold text-slate-500 mb-6">هل تريد تسجيل {pendingAction.name === 'recordSale' ? 'بيعة' : 'سند'} لـ {pendingAction.args.customer_name || pendingAction.args.person_name}؟</p>
                <div className="flex gap-3">
                  <button onClick={confirmAction} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black">تأكيد</button>
                  <button onClick={() => setPendingAction(null)} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-black">إلغاء</button>
                </div>
              </div>
            )}

            <button onClick={closeSession} className="text-white/50 font-bold text-sm underline">إنهاء الجلسة</button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
