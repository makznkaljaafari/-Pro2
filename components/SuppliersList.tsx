import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Supplier } from '../types';
import { shareToWhatsApp, shareToTelegram, formatSupplierStatement } from '../services/shareService';
import { financeService } from '../services/financeService';

const SuppliersList: React.FC = () => {
  const { suppliers, purchases, vouchers, navigate, deleteSupplier, updateSupplier, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Supplier>>({});

  const handleShare = (supplier: Supplier, platform: 'wa' | 'tg') => {
    const balances = financeService.getSupplierBalances(supplier.id, purchases, vouchers);
    const text = formatSupplierStatement(supplier, purchases, vouchers, balances);
    if (platform === 'wa') shareToWhatsApp(text, supplier.phone);
    else shareToTelegram(text);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.includes(searchTerm) || s.phone.includes(searchTerm)
  );

  const handleDelete = (s: Supplier) => {
    if (window.confirm(`هل أنت متأكد من حذف المورد "${s.name}"؟`)) {
      deleteSupplier(s.id);
      addNotification("تم الحذف ✅", `تم حذف المورد ${s.name}.`, "info");
    }
  };

  return (
    <PageLayout title="إدارة الموردين" onBack={() => navigate('dashboard')} headerGradient="from-orange-700 to-amber-900">
      <div className="space-y-6 pt-2 page-enter">
        <div className="relative">
          <input 
            type="text"
            placeholder="ابحث باسم المورد أو رقم هاتفه..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-2xl p-6 pr-16 outline-none focus:border-orange-500 transition-all font-black text-lg shadow-sm text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30">🔍</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-orange-600 text-white font-black">
                  <th className="p-5 text-center w-12 text-white">#</th>
                  <th className="p-5 text-white">اسم المورد</th>
                  <th className="p-5 text-white">رقم الجوال</th>
                  <th className="p-5 text-center text-white">المستحقات</th>
                  <th className="p-5 text-center text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((s, index) => {
                  const balances = financeService.getSupplierBalances(s.id, purchases, vouchers);
                  return (
                    <tr key={s.id} className={`border-b border-gray-100 dark:border-slate-800 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/30 dark:bg-slate-800/40'}`}>
                      <td className="p-4 text-center font-black opacity-40">{index + 1}</td>
                      <td className="p-4 font-black text-gray-900 dark:text-white">{s.name}</td>
                      <td className="p-4 font-black text-orange-600 tabular-nums">{s.phone}</td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {balances.map(b => b.amount !== 0 ? (
                            <span key={b.currency} className={`font-black text-sm ${b.amount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {b.amount.toLocaleString()} <span className="text-[10px] opacity-60 uppercase">{b.currency}</span>
                            </span>
                          ) : null)}
                          {balances.every(b => b.amount === 0) && <span className="opacity-20 text-xs">مصفى ✅</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleShare(s, 'wa')} className="w-9 h-9 bg-green-500 text-white rounded-lg flex items-center justify-center shadow-md active:scale-90">💬</button>
                          <button onClick={() => navigate('add-voucher', { type: 'دفع', personId: s.id, personType: 'مورد' })} className="w-9 h-9 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center border border-orange-200 active:scale-90">📤</button>
                          <button onClick={() => handleDelete(s)} className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-100 active:scale-90">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <button onClick={() => navigate('add-supplier')} className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 flex items-center gap-3">
            <span>إضافة مورد جديد</span>
            <span className="text-2xl">＋</span>
          </button>
        </div>
      </div>
      <div className="pb-32"></div>
    </PageLayout>
  );
};

export default SuppliersList;