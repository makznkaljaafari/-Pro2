import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis, CartesianGrid } from 'recharts';
import { getFinancialForecast } from '../services/geminiService';
import { financeService } from '../services/financeService';

const Reports: React.FC = () => {
  const { sales, expenses, purchases, vouchers, customers, suppliers, navigate } = useApp();
  const [forecast, setForecast] = useState<string>('جاري تحليل البيانات سحابياً...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const aiForecast = await getFinancialForecast(sales, expenses);
      setForecast(aiForecast);
      setIsLoading(false);
    };
    fetchData();
  }, [sales, expenses]);

  // حساب الميزانية العالمية عبر الخدمة المركزية
  const budgetSummary = useMemo(() => {
    return financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers);
  }, [customers, suppliers, sales, purchases, vouchers]);

  // تجهيز بيانات الرسم البياني للنمو المالي (آخر 10 عمليات مبيعات)
  const chartData = useMemo(() => {
    return sales.slice(0, 10).reverse().map((s, i) => ({
      name: `ع ${i+1}`,
      sales: s.total,
      date: new Date(s.date).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' })
    }));
  }, [sales]);

  return (
    <PageLayout title="المحلل المالي الذكي" onBack={() => navigate('dashboard')} headerGradient="from-indigo-600 via-purple-700 to-indigo-950">
      <div className="space-y-6 pt-4 page-enter pb-32">
        
        {/* ملخص الميزانية الصافي */}
        <div className="grid grid-cols-1 gap-4">
           {budgetSummary.map(s => (s.assets > 0 || s.liabilities > 0) && (
              <div key={s.currency} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
                 <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">{s.currency}</span>
                    <p className={`font-black text-lg tabular-nums ${s.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                       {s.net >= 0 ? '+' : ''}{s.net.toLocaleString()}
                    </p>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl">
                       <p className="text-[9px] font-black text-blue-600 uppercase mb-1">إجمالي المستحقات (لنا)</p>
                       <p className="font-black text-sm tabular-nums text-slate-700 dark:text-slate-300">{s.assets.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-2xl">
                       <p className="text-[9px] font-black text-orange-600 uppercase mb-1">إجمالي الديون (علينا)</p>
                       <p className="font-black text-sm tabular-nums text-slate-700 dark:text-slate-300">{s.liabilities.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* الرسم البياني لنمو المبيعات */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6 px-2">
             <h3 className="font-black text-sm text-indigo-900 dark:text-white uppercase tracking-tight">حركة المبيعات الأخيرة 📈</h3>
             <span className="text-[10px] font-black text-slate-400">آخر 10 فواتير</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', background: '#0f172a', color: '#fff' }} 
                  itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* تحليل Gemini المعمق */}
        <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-6">
             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10">🔮</div>
             <div>
                <h3 className="font-black text-xl">توقعات المحاسب الذكي</h3>
                <p className="text-[10px] font-bold text-indigo-300">تحليل مدعوم بـ Gemini 3 Pro</p>
             </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 min-h-[100px]">
             {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                   <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="font-black text-sm text-indigo-200">جاري قراءة سجلاتك المالية...</p>
                </div>
             ) : (
                <p className="font-bold leading-relaxed text-sm whitespace-pre-line text-indigo-100 italic">
                   "{forecast}"
                </p>
             )}
          </div>
          <div className="flex gap-3 mt-8 no-print">
            <button onClick={() => window.print()} className="flex-1 bg-white text-indigo-900 py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">طباعة التقرير 📄</button>
            <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">مشاركة 📤</button>
          </div>
        </section>

      </div>
    </PageLayout>
  );
};

export default Reports;