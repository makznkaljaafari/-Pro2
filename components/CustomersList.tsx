import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Customer } from '../types';
import { formatCustomerStatement, shareToWhatsApp, shareToTelegram } from '../services/shareService';
import { financeService } from '../services/financeService';

const CustomersList: React.FC = () => {
  const { customers, sales, vouchers, navigate, deleteRecord, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const handleShareWhatsApp = (customer: Customer) => {
    const debts = financeService.getCustomerBalances(customer.id, sales, vouchers);
    const text = formatCustomerStatement(customer, sales, vouchers, debts);
    shareToWhatsApp(text, customer.phone);
  };

  const handleShareTelegram = (customer: Customer) => {
    const debts = financeService.getCustomerBalances(customer.id, sales, vouchers);
    const text = formatCustomerStatement(customer, sales, vouchers, debts);
    shareToTelegram(text);
  };

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`هل أنت متأكد من حذف العميل "${customer.name}"؟ سيتم حذف بياناته نهائياً.`)) {
      deleteRecord('customers', customer.id);
      addNotification("تم الحذف ✅", `تم حذف العميل ${customer.name} بنجاح.`, "info");
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.includes(searchTerm) || c.phone.includes(searchTerm)
  );

  return (
    <PageLayout 
      title="إدارة العملاء" 
      onBack={() => navigate('dashboard')} 
      headerGradient="from-blue-700 to-indigo-900"
      headerExtra={
        <button 
          onClick={() => navigate('add-customer')}
          className="w-12 h-12 bg-white/20 dark:bg-slate-700/50 rounded-2xl backdrop-blur-md flex items-center justify-center text-2xl transition-all active:scale-90 border border-white/20 shadow-lg"
        >
          ➕
        </button>
      }
    >
      <div className="space-y-6 pt-2 page-enter">
        <div className="relative group">
          <input 
            type="text"
            placeholder="ابحث باسم العميل أو رقم هاتفه..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-2xl p-6 pr-16 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-black text-lg shadow-sm text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30">🔍</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-blue-600 text-white font-black">
                  <th className="p-5 text-center w-12 text-white">#</th>
                  <th className="p-5 text-white">الاسم الكامل</th>
                  <th className="p-5 text-white">رقم الهاتف</th>
                  <th className="p-5 text-center text-white">المديونية</th>
                  <th className="p-5 text-center text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c, index) => {
                  const debts = financeService.getCustomerBalances(c.id, sales, vouchers);
                  return (
                    <tr key={c.id} className={`border-b border-gray-100 dark:border-slate-800 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/30 dark:bg-slate-800/40'}`}>
                      <td className="p-4 text-center font-black opacity-40">{index + 1}</td>
                      <td className="p-4 font-black text-gray-900 dark:text-white">{c.name}</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                        <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {debts.map(d => d.amount > 0 ? (
                            <span key={d.currency} className="font-black text-sm text-red-500 tabular-nums">
                              {d.amount.toLocaleString()} <span className="text-[10px] opacity-60 uppercase">{d.currency}</span>
                            </span>
                          ) : null)}
                          {debts.every(d => d.amount <= 0) && <span className="opacity-20 text-xs">مصفى ✅</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleShareWhatsApp(c)} className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-all">💬</button>
                          <button onClick={() => navigate('add-voucher', { type: 'قبض', personId: c.id, personType: 'عميل' })} className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center active:scale-90 transition-all">📥</button>
                          <button onClick={() => handleDelete(c)} className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-100 active:scale-90 transition-all">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="pb-32"></div>
    </PageLayout>
  );
};

export default CustomersList;