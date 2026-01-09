
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { getChatResponse, speakText, stopSpeaking } from '../services/geminiService';
import { ChatMessage, Customer, Supplier, QatCategory } from '../types';
import { shareToWhatsApp, shareToTelegram, formatCustomerStatement, formatSupplierStatement, formatSaleInvoice } from '../services/shareService';

interface PendingAction {
  id: string;
  name: string;
  args: any;
  toolCallId: string;
}

const AIAdvisor: React.FC = () => {
  const { 
    sales, customers, purchases, vouchers, categories, suppliers, exchangeRates, navigate, 
    addSale, addPurchase, addVoucher, addCategory, deleteSale, addNotification 
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: 'أهلاً بك يا مدير! أنا محاسبك الذكي. اقدر أسجل لك مبيعات، مشتريات، سندات، أو أرسل كشوفات للعملاء. إيش تشتي أسوي لك الآن؟',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const aiResponse = await getChatResponse(input, messages, { sales, customers, purchases, vouchers, categories, suppliers, rates: exchangeRates });
    
    if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
      const call = aiResponse.toolCalls[0]; // التعامل مع أول طلب فقط للتبسيط
      setPendingAction({
        id: Math.random().toString(),
        name: call.name,
        args: call.args,
        toolCallId: call.id
      });
    }

    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: aiResponse.text || "تم استلام طلبك.", timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
    if (modelMsg.text.length < 300) handleSpeak(modelMsg.text);
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { name, args } = pendingAction;
    let resultText = "تم التنفيذ بنجاح.";

    try {
      switch (name) {
        case 'recordSale': {
          const customer = customers.find(c => c.name.includes(args.customer_name)) || customers[0];
          addSale({
            customer_id: customer.id, customer_name: customer.name, qat_type: args.qat_type,
            quantity: args.quantity, unit_price: args.unit_price, total: args.quantity * args.unit_price,
            status: args.status, currency: args.currency, notes: 'عبر المحاسب الذكي'
          });
          resultText = `✅ تم تسجيل بيعة لـ ${customer.name} بمبلغ ${args.quantity * args.unit_price} ${args.currency}.`;
          break;
        }
        case 'recordPurchase': {
          const supplier = suppliers.find(s => s.name.includes(args.supplier_name)) || suppliers[0];
          addPurchase({
            supplier_id: supplier.id, supplier_name: supplier.name, qat_type: args.qat_type,
            quantity: args.quantity, unit_price: args.unit_price, total: args.quantity * args.unit_price,
            status: args.status, currency: args.currency, notes: 'عبر المحاسب الذكي'
          });
          resultText = `✅ تم تسجيل مشتريات من ${supplier.name} بنجاح.`;
          break;
        }
        case 'recordVoucher': {
          const person = args.person_type === 'عميل' 
            ? customers.find(c => c.name.includes(args.person_name))
            : suppliers.find(s => s.name.includes(args.person_name));
          
          if (person) {
            addVoucher({
              type: args.type, person_id: person.id, person_name: person.name,
              person_type: args.person_type, amount: args.amount, currency: args.currency,
              notes: args.notes || 'سند مالي آلي'
            });
            resultText = `✅ تم تسجيل سند ${args.type} لـ ${person.name} بمبلغ ${args.amount}.`;
          }
          break;
        }
        case 'shareStatement': {
          const customer = customers.find(c => c.name.includes(args.target_name));
          if (customer) {
            const debts = sales.filter(s => s.customer_id === customer.id && s.status === 'آجل');
            const statementText = formatCustomerStatement(customer, sales, vouchers, []);
            if (args.platform === 'whatsapp') shareToWhatsApp(statementText, customer.phone);
            else shareToTelegram(statementText);
            resultText = `📤 جاري مشاركة كشف حساب ${customer.name} عبر ${args.platform}.`;
          }
          break;
        }
        case 'manageProduct': {
          addCategory({
            name: args.name, stock: 0, price: args.price, currency: args.currency
          });
          resultText = `✅ تم إضافة الصنف ${args.name} بسعر ${args.price}.`;
          break;
        }
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: resultText,
        timestamp: new Date().toISOString()
      }]);
      addNotification("تمت العملية ✅", resultText, "success");
    } catch (e) {
      addNotification("خطأ ❌", "فشل تنفيذ العملية", "warning");
    }

    setPendingAction(null);
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); return; }
    setIsSpeaking(true);
    await speakText(text, () => setIsSpeaking(false));
  };

  return (
    <PageLayout title="المحاسب الذكي" onBack={() => navigate('dashboard')} headerGradient="from-slate-900 to-emerald-900">
      <div className="flex flex-col h-[78vh] max-w-2xl mx-auto space-y-4">
        
        {/* شاشة الدردشة */}
        <div ref={scrollRef} className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 overflow-y-auto no-scrollbar space-y-6 border border-gray-100 dark:border-slate-800 shadow-inner">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-5 rounded-[1.8rem] shadow-sm ${m.role === 'user' ? 'bg-slate-100 text-slate-800 rounded-bl-none' : 'bg-emerald-700 text-white rounded-br-none'}`}>
                <p className="font-bold text-sm whitespace-pre-line leading-relaxed">{m.text}</p>
                <div className="flex justify-between items-center mt-3 opacity-40">
                  <span className="text-[8px]">{new Date(m.timestamp).toLocaleTimeString('ar-YE')}</span>
                  {m.role === 'model' && <button onClick={() => handleSpeak(m.text)} className="text-xs">{isSpeaking ? '⏹️' : '🔊'}</button>}
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="flex gap-2 p-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div></div>}
        </div>

        {/* نموذج التأكيد المنبثق */}
        {pendingAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">⚡</div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">تأكيد العملية</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl text-right space-y-2 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-black text-slate-400 uppercase">نوع المعاملة</p>
                  <p className="font-black text-emerald-600">
                    {pendingAction.name === 'recordSale' ? 'فاتورة مبيعات' : 
                     pendingAction.name === 'recordPurchase' ? 'فاتورة مشتريات' : 
                     pendingAction.name === 'recordVoucher' ? `سند ${pendingAction.args.type}` : 
                     pendingAction.name === 'shareStatement' ? 'مشاركة كشف حساب' : 'إدارة مخزون'}
                  </p>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                  <p className="text-[10px] font-bold text-slate-500">
                    {pendingAction.name.includes('record') ? 
                      `المبلغ: ${pendingAction.args.amount || (pendingAction.args.quantity * pendingAction.args.unit_price)} ${pendingAction.args.currency}` : 
                      `المستهدف: ${pendingAction.args.customer_name || pendingAction.args.target_name || pendingAction.args.name}`}
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={confirmAction} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all">تأكيد التنفيذ</button>
                  <button onClick={() => setPendingAction(null)} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-black active:scale-95">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* منطقة الإدخال */}
        <form onSubmit={handleSend} className="relative group">
          <input 
            type="text" 
            className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500 rounded-[2rem] p-6 pr-10 pl-24 font-black text-slate-800 dark:text-white shadow-lg outline-none transition-all" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="اطلب تسجيل بيعة، مشتريات أو كشف..." 
          />
          <button 
            type="submit" 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-16 h-14 bg-emerald-600 text-white rounded-2xl font-black shadow-xl active:scale-90 flex items-center justify-center group-focus-within:bg-emerald-500"
          >
            <span className="text-xl">⚡</span>
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default AIAdvisor;
