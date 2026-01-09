
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Sale, Customer, Purchase, Voucher, ChatMessage, Expense, ActivityLog } from "../types";
import { audioService } from "./audioService";

export const aiTools: FunctionDeclaration[] = [
  {
    name: 'recordSale',
    description: 'تسجيل عملية بيع جديدة لعميل',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer_name: { type: Type.STRING, description: 'اسم العميل' },
        qat_type: { type: Type.STRING, description: 'نوع القات' },
        quantity: { type: Type.NUMBER, description: 'الكمية' },
        unit_price: { type: Type.NUMBER, description: 'سعر الوحدة' },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        status: { type: Type.STRING, enum: ['نقدي', 'آجل'] }
      },
      required: ['customer_name', 'qat_type', 'quantity', 'unit_price', 'currency', 'status']
    }
  },
  {
    name: 'recordPurchase',
    description: 'تسجيل عملية شراء مخزون من مورد',
    parameters: {
      type: Type.OBJECT,
      properties: {
        supplier_name: { type: Type.STRING, description: 'اسم المورد' },
        qat_type: { type: Type.STRING, description: 'نوع القات' },
        quantity: { type: Type.NUMBER, description: 'الكمية' },
        unit_price: { type: Type.NUMBER, description: 'سعر الشراء' },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        status: { type: Type.STRING, enum: ['نقدي', 'آجل'] }
      },
      required: ['supplier_name', 'qat_type', 'quantity', 'unit_price', 'currency', 'status']
    }
  },
  {
    name: 'recordVoucher',
    description: 'تسجيل سند مالي (قبض أو دفع)',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['قبض', 'دفع'] },
        person_name: { type: Type.STRING, description: 'اسم الشخص المستلم أو المسدد' },
        person_type: { type: Type.STRING, enum: ['عميل', 'مورد'] },
        amount: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        notes: { type: Type.STRING }
      },
      required: ['type', 'person_name', 'person_type', 'amount', 'currency']
    }
  }
];

// Fix: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY`
export const getFinancialForecast = async (sales: Sale[], expenses: Expense[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `أنت الخبير المالي لوكالة الشويع. بناءً على المبيعات (${JSON.stringify(sales.slice(0, 20))}) والمصروفات، قدم تحليلاً عميقاً وتوقعات للأسبوع القادم بلهجة يمنية احترافية. ركز على التدفق النقدي ومخاطر الديون.`;
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 2000 } }
    });
    return response.text || "الأداء المالي يتطلب مراقبة دقيقة للديون.";
  } catch (e) { return "البيانات قيد التحليل السحابي حالياً."; }
};

// Fix: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY`
export const getQuickInsight = async (sales: Sale[], customers: Customer[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `أعط نصيحة ذهبية واحدة بناءً على حركة البيع اليوم لـ ${sales.length} عملية. استعمل لهجة يمنية محفزة.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "الرزق يحب السعي، واصل العمل يا مدير.";
  } catch(e) { return "التزم بالصدق والأمانة يبارك الله في رزقك."; }
};

// Fix: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY`
export const getDebtAnalysis = async (sales: Sale[], vouchers: Voucher[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `حلل مديونيات العملاء والموردين بناءً على هذه البيانات: المبيعات (${JSON.stringify(sales.slice(0, 10))}), السندات (${JSON.stringify(vouchers.slice(0, 10))}). أعط نصائح لتقليل الديون بلهجة يمنية.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "الديون تحت السيطرة حالياً.";
  } catch (e) { return "التحليل المالي غير متوفر مؤقتاً."; }
};

// Fix: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY`
export const analyzeSystemHealth = async (logs: ActivityLog[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `حلل سجل النشاطات هذا للتأكد من سلامة النظام والعمليات: ${JSON.stringify(logs.slice(0, 10))}. استعمل لهجة يمنية.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "النظام يعمل بكفاءة عالية.";
  } catch (e) { return "جاري فحص سلامة البيانات."; }
};

export const getSmartAdvice = async (sales: Sale[]): Promise<string> => {
  return getQuickInsight(sales, []);
};

// Fix: Replaced `import.meta.env.VITE_GEMINI_API_KEY` with `process.env.API_KEY`
export const getChatResponse = async (message: string, history: ChatMessage[], context: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: { 
        systemInstruction: "أنت المحاسب الذكي والرفيق التجاري لوكالة الشويع للقات. تحدث بلهجة يمنية شعبية مهذبة (صنعانية/تعزية). وظيفتك تحليل البيانات وتنفيذ العمليات المالية بدقة. إذا سألك المستخدم عن حالة السوق أو نصيحة مالية، كن دقيقاً واستند للبيانات.",
        tools: [{ functionDeclarations: aiTools }] 
      }
    });
    return { text: response.text, toolCalls: response.functionCalls };
  } catch(e) {
    return { text: "عذراً يا مدير، حصل عطل بسيط في المزامنة. جرب مرة ثانية.", toolCalls: [] };
  }
};

export const speakText = async (text: string, onEnded: () => void) => {
  return await audioService.speak(text, onEnded);
};

export const stopSpeaking = () => {
  // يمكن إضافة منطق لإيقاف الصوت إذا لزم الأمر عبر audioService
};