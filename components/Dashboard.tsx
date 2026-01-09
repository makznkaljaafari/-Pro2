
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { getQuickInsight } from '../services/geminiService';
import { shareToWhatsApp, formatCustomerStatement } from '../services/shareService';
import { financeService } from '../services/financeService';

const Dashboard: React.FC = () => {
  const { 
    user, navigate, theme, toggleTheme, notifications, 
    sales, purchases, expenses, wasteRecords, vouchers, categories, 
    customers, suppliers
  } = useApp();
  
  const [aiInsight, setAiInsight] = useState<string>('اضغط للحصول على نصيحة ذكية 💡');
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const budgetSummary = useMemo(() => {
    return financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers);
  }, [customers, suppliers, sales, purchases, vouchers]);

  const yerSummary = budgetSummary.find(s => s.currency === 'YER') || { assets: 0, liabilities: 0, net: 0 };

  const totals = useMemo(() => {
    const s = sales?.filter(s => !s.is_returned).reduce((sum, item) => sum + item.total, 0) || 0;
    const p = purchases?.filter(p => !p.is_returned).reduce((sum, item) => sum + item.total, 0) || 0;
    const e = expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
    return { s, p, e };
  }, [sales, purchases, expenses]);

  const mainServices = [
    { id: 'purchases', label: 'المشتريات', icon: '📦', color: 'bg-orange-600', count: purchases.length },
    { id: 'vouchers', label: 'السندات', icon: '📥', color: 'bg-blue-600', count: vouchers.length },
    { id: 'expenses', label: 'المصاريف', icon: '💸', color: 'bg-amber-600', count: expenses.length },
    { id: 'waste', label: 'التالف', icon: '🥀', color: 'bg-rose-600', count: wasteRecords.length },
    { id: 'categories', label: 'المخزون', icon: '🌿', color: 'bg-teal-600', count: categories.length },
    { id: 'suppliers', label: 'الموردين', icon: '🚛', color: 'bg-orange-700', count: suppliers.length },
    { id: 'reports', label: 'التقارير', icon: '📊', color: 'bg-purple-600', count: null },
    { id: 'ai-advisor', label: 'المستشار', icon: '🔮', color: 'bg-violet-700', count: null },
    { id: 'activity-log', label: 'الرقابة', icon: '🛡️', color: 'bg-slate-700', count: null },
  ];

  const generateInsight = async () => {
    setIsInsightLoading(true);
    const insight = await getQuickInsight(sales, []);
    setAiInsight(insight);
    setIsInsightLoading(false);
  };

  const handleQuickStatement = (customer: any) => {
    const debts = financeService.getCustomerBalances(customer.id, sales, vouchers);
    const text = formatCustomerStatement(customer, sales, vouchers, debts);
    shareToWhatsApp(text, customer.phone);
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c => c.name.includes(customerSearch)).slice(0, 3);
  }, [customerSearch, customers]);

  return (
    <PageLayout 
      title={user?.agency_name || 'وكالة الشويع'}
      headerExtra={
        <div className="flex gap-2">
          <button onClick={() => navigate('settings')} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl shadow-sm active:scale-90 transition-all">⚙️</button>
          <button onClick={toggleTheme} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform active:scale-90">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => navigate('notifications')} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl relative shadow-sm transition-transform active:scale-90">
            🔔 {unreadCount > 0 && <span className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-red-600 rounded-full text-[10px] flex items-center justify-center font-black text-white border-2 border-white">{unreadCount}</span>}
          </button>
        </div>
      }
    >
      <div className="space-y-6 pt-0 pb-32 page-enter">
        
        {/* ملخص الميزانية الضخم */}
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
           <div className="relative z-10 flex justify-between items-center">
              <div>
                 <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">صافي الميزانية (ريال يمني)</p>
                 <h2 className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-2xl">
                    {yerSummary.net.toLocaleString()}
                 </h2>
              </div>
              <button onClick={() => navigate('debts')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-sm font-black backdrop-blur-md transition-all">التفاصيل ←</button>
           </div>
           <div className="mt-10 grid grid-cols-2 gap-6 relative z-10">
              <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5">
                 <p className="text-[10px] font-bold text-blue-300 uppercase mb-2">ديون لنا عند العملاء</p>
                 <p className="text-2xl font-black tabular-nums text-white">+{yerSummary.assets.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5">
                 <p className="text-[10px] font-bold text-red-300 uppercase mb-2">ديون علينا للموردين</p>
                 <p className="text-2xl font-black tabular-nums text-white">-{yerSummary.liabilities.toLocaleString()}</p>
              </div>
           </div>
           <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
           <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 text-center">
              <p className="text-[11px] font-black text-emerald-600 uppercase mb-1">المبيعات</p>
              <p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{totals.s.toLocaleString()}</p>
           </div>
           <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-[2rem] border border-orange-100 dark:border-orange-800/30 text-center">
              <p className="text-[11px] font-black text-orange-600 uppercase mb-1">المشتريات</p>
              <p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{totals.p.toLocaleString()}</p>
           </div>
           <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-[2rem] border border-rose-100 dark:border-rose-800/30 text-center">
              <p className="text-[11px] font-black text-rose-600 uppercase mb-1">المصاريف</p>
              <p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{totals.e.toLocaleString()}</p>
           </div>
        </div>

        <section className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
           <div className="flex justify-between items-center mb-6 px-4">
              <h3 className="text-lg font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">الخدمات الإدارية 🛠️</h3>
           </div>
           <div className="grid grid-cols-3 gap-4">
              {mainServices.map(service => (
                <button 
                  key={service.id} 
                  onClick={() => navigate(service.id as any)}
                  className="group flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                   <div className={`${service.color} w-16 h-16 rounded-3xl flex items-center justify-center text-3xl text-white shadow-xl transition-transform group-hover:scale-110`}>
                      {service.icon}
                   </div>
                   <span className="text-md font-black text-slate-800 dark:text-slate-200 leading-tight">{service.label}</span>
                   {service.count !== null && (
                      <span className="text-xs font-bold text-slate-400">
                         {service.count} سجل
                      </span>
                   )}
                </button>
              ))}
           </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
           <button onClick={() => navigate('add-sale')} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-emerald-500/20 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all">
              <span className="text-5xl group-hover:scale-110 transition-transform">💰</span>
              <div className="text-center">
                 <p className="font-black text-2xl text-emerald-600">بيع جديد</p>
                 <p className="text-xs text-slate-400 font-bold uppercase">فاتورة سريعة</p>
              </div>
           </button>
           <button onClick={() => navigate('add-purchase')} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-orange-500/20 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all">
              <span className="text-5xl group-hover:scale-110 transition-transform">📦</span>
              <div className="text-center">
                 <p className="font-black text-2xl text-orange-600">شراء جديد</p>
                 <p className="text-xs text-slate-400 font-bold uppercase">توريد مخزون</p>
              </div>
           </button>
        </div>

      </div>
    </PageLayout>
  );
};

export default Dashboard;
