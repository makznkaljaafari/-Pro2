import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, shareToTelegram, formatBudgetSummary, formatCustomerStatement } from '../services/shareService';
import { financeService } from '../services/financeService';

const DebtsReport: React.FC = () => {
  const { customers, suppliers, sales, purchases, vouchers, navigate } = useApp();

  const currencies = ['YER', 'SAR', 'OMR'] as const;

  const budgetSummary = useMemo(() => {
    return financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers);
  }, [customers, suppliers, sales, purchases, vouchers]);

  const customerDebts = useMemo(() => {
    return customers.map(c => ({
      ...c,
      debts: financeService.getCustomerBalances(c.id, sales, vouchers).filter(d => d.amount > 0)
    })).filter(c => c.debts.length > 0);
  }, [customers, sales, vouchers]);

  const supplierDebts = useMemo(() => {
    return suppliers.map(s => ({
      ...s,
      debts: financeService.getSupplierBalances(s.id, purchases, vouchers).filter(d => d.amount > 0)
    })).filter(s => s.debts.length > 0);
  }, [suppliers, purchases, vouchers]);

  const handleShareSummary = (platform: 'wa' | 'tg') => {
    const text = formatBudgetSummary(budgetSummary.filter(s => s.assets > 0 || s.liabilities > 0));
    if (platform === 'wa') shareToWhatsApp(text);
    else shareToTelegram(text);
  };

  const handleCustomerStatement = (customer: any) => {
    const text = formatCustomerStatement(customer, sales, vouchers, customer.debts);
    shareToWhatsApp(text, customer.phone);
  };

  return (
    <PageLayout 
      title="الديون والميزانية التفصيلية" 
      onBack={() => navigate('dashboard')} 
      headerGradient="from-slate-900 via-red-900 to-slate-900"
      headerExtra={
        <button 
          onClick={() => navigate('add-opening-balance')} 
          className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl border border-white/20 active:scale-90 transition-all shadow-lg group relative"
          title="تسجيل أرصدة سابقة"
        >
          📜
        </button>
      }
    >
      <div className="space-y-12 pt-4 page-enter">
        
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-900 p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-black text-xl text-white flex items-center gap-3">
              <span className="text-2xl">⚖️</span> ملخص الميزانية
            </h3>
            <div className="flex gap-2">
               <button onClick={() => handleShareSummary('wa')} className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center text-lg shadow-md active:scale-95">💬</button>
               <button onClick={() => handleShareSummary('tg')} className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center text-lg shadow-md active:scale-95">✈️</button>
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="p-5 border-b border-gray-100 dark:border-slate-700">العملة</th>
                  <th className="p-5 border-b border-gray-100 dark:border-slate-700">لنا (عند العملاء)</th>
                  <th className="p-5 border-b border-gray-100 dark:border-slate-700">علينا (للموردين)</th>
                  <th className="p-5 border-b border-gray-100 dark:border-slate-700 text-center">الصافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {budgetSummary.map(curData => {
                  if (curData.assets === 0 && curData.liabilities === 0) return null;

                  return (
                    <tr key={curData.currency} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-5">
                        <span className="bg-slate-900 text-white px-4 py-1.5 rounded-lg font-black text-sm">{curData.currency}</span>
                      </td>
                      <td className="p-5 font-black text-blue-600 dark:text-blue-400 tabular-nums">+{curData.assets.toLocaleString()}</td>
                      <td className="p-5 font-black text-orange-600 dark:text-orange-400 tabular-nums">-{curData.liabilities.toLocaleString()}</td>
                      <td className="p-5 text-center font-black">
                        <span className={`inline-block min-w-[100px] px-4 py-2 rounded-xl tabular-nums ${curData.net >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                          {curData.net.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black text-blue-900 dark:text-blue-400 px-2">ديون العملاء (لنا)</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden border border-blue-50 dark:border-slate-800">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white font-black text-sm">
                    <th className="p-5">العميل</th>
                    <th className="p-5 text-center">المبلغ</th>
                    <th className="p-5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {customerDebts.flatMap((c) => 
                    c.debts.map((d) => (
                      <tr key={`${c.id}-${d.currency}`} className="border-b border-gray-100 dark:border-slate-800">
                        <td className="p-4 font-black text-slate-800 dark:text-white">{c.name}</td>
                        <td className="p-4 text-center font-black text-red-600 dark:text-red-400 tabular-nums">{d.amount.toLocaleString()} <span className="text-[10px] opacity-50">{d.currency}</span></td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <button onClick={() => handleCustomerStatement(c)} className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center shadow active:scale-90" title="كشف حساب">💬</button>
                             <button 
                                onClick={() => navigate('add-voucher', { 
                                  type: 'قبض', 
                                  personId: c.id, 
                                  personType: 'عميل',
                                  amount: d.amount,
                                  currency: d.currency
                                })} 
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md active:scale-90"
                              >
                                سداد
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black text-orange-900 dark:text-orange-400 px-2">ديون الموردين (علينا)</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden border border-orange-50 dark:border-slate-800">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-orange-600 text-white font-black text-sm">
                    <th className="p-5">المورد</th>
                    <th className="p-5 text-center">المبلغ</th>
                    <th className="p-5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierDebts.flatMap((s) => 
                    s.debts.map((d) => (
                      <tr key={`${s.id}-${d.currency}`} className="border-b border-gray-100 dark:border-slate-800">
                        <td className="p-4 font-black text-slate-800 dark:text-white">{s.name}</td>
                        <td className="p-4 text-center font-black text-orange-600 dark:text-orange-400 tabular-nums">{d.amount.toLocaleString()} <span className="text-[10px] opacity-50">{d.currency}</span></td>
                        <td className="p-4 text-center">
                           <div className="flex items-center justify-center gap-2">
                              <button onClick={() => navigate('suppliers')} className="w-8 h-8 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center border border-orange-200 active:scale-90" title="تفاصيل المورد">👁️</button>
                              <button 
                                onClick={() => navigate('add-voucher', { 
                                  type: 'دفع', 
                                  personId: s.id, 
                                  personType: 'مورد',
                                  amount: d.amount,
                                  currency: d.currency
                                })} 
                                className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-md active:scale-90"
                              >
                                سداد
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
      <div className="pb-40"></div>
    </PageLayout>
  );
};

export default DebtsReport;