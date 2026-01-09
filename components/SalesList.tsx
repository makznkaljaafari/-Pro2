
import React, { useState, memo, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Sale } from '../types';
import { formatSaleInvoice, shareToWhatsApp } from '../services/shareService';

const SaleRow = memo(({ 
  sale, 
  index, 
  onWhatsApp, 
  onPrint,
  onReturn,
  onDelete
}: { 
  sale: Sale, 
  index: number, 
  onWhatsApp: (s: Sale) => void, 
  onPrint: (s: Sale) => void,
  onReturn: (s: Sale) => void,
  onDelete: (s: Sale) => void
}) => (
  <tr className={`border-b border-gray-100 dark:border-slate-800 transition-colors ${sale.is_returned ? 'opacity-40 grayscale-[0.5]' : ''} ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/40'}`}>
    <td className="p-5 text-center font-black text-slate-400 text-sm">
      {sale.is_returned ? '🔄' : index + 1}
    </td>
    <td className="p-5 font-black text-slate-900 dark:text-white text-lg">
      {sale.customer_name}
      {sale.is_returned && <span className="block text-[10px] text-red-500 font-black">مرتجع</span>}
    </td>
    <td className="p-5 font-bold text-slate-700 dark:text-slate-200 text-sm text-center">
      <span className="bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl font-black">{sale.qat_type}</span>
    </td>
    <td className="p-5 text-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-green-600 tabular-nums">{sale.total.toLocaleString()}</span>
        <span className="text-[10px] font-black uppercase text-slate-400">{sale.currency}</span>
      </div>
    </td>
    <td className="p-5">
      <div className="flex items-center justify-center gap-2">
        {!sale.is_returned && (
          <>
            <button onClick={() => onWhatsApp(sale)} className="w-11 h-11 bg-green-50 text-green-600 rounded-xl flex items-center justify-center active:scale-90 transition-all border-2 border-green-100 shadow-sm text-2xl">💬</button>
            <button onClick={() => onPrint(sale)} className="w-11 h-11 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center active:scale-90 transition-all border-2 border-gray-100 shadow-sm text-2xl">📄</button>
            <button onClick={() => onReturn(sale)} className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center active:scale-90 transition-all border-2 border-amber-100 shadow-sm text-2xl" title="إرجاع">🔄</button>
          </>
        )}
        <button onClick={() => onDelete(sale)} className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center active:scale-90 transition-all border-2 border-red-100 shadow-sm text-2xl" title="حذف">🗑️</button>
      </div>
    </td>
  </tr>
));

const SalesList: React.FC = () => {
  const { sales, navigate, deleteSale, returnSale, user, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'الكل' | 'نقدي' | 'آجل' | 'مرتجع'>('الكل');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           sale.qat_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filter === 'الكل' ? true :
        filter === 'مرتجع' ? sale.is_returned :
        sale.status === filter && !sale.is_returned;
      return matchesSearch && matchesFilter;
    });
  }, [sales, searchTerm, filter]);

  const handlePrint = (sale: Sale) => {
    navigate('invoice-view', { sale });
  };

  const handleReturn = (sale: Sale) => {
    if (window.confirm(`هل أنت متأكد من إرجاع فاتورة ${sale.customer_name}؟ سيتم إعادة الكمية للمخزون.`)) {
      returnSale(sale.id);
      addNotification("تم الإرجاع ✅", `تم تحويل الفاتورة لمرتجع وتصحيح المخزون.`, "info");
    }
  };

  const handleDelete = (sale: Sale) => {
    if (window.confirm(`هل أنت متأكد من الحذف النهائي؟ سيتم تعديل المخزون تلقائياً.`)) {
      deleteSale(sale.id, true);
      addNotification("تم الحذف 🗑️", `تم حذف الفاتورة نهائياً.`, "warning");
    }
  };

  const handleWhatsApp = (sale: Sale) => shareToWhatsApp(formatSaleInvoice(sale, user?.agency_name || 'وكالة الشويع'));

  return (
    <PageLayout title="سجل المبيعات" onBack={() => navigate('dashboard')}>
      <div className="space-y-6 pt-1 page-enter">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-slate-800 space-y-4 no-print transform-gpu">
          <input 
            type="text"
            placeholder="ابحث باسم العميل أو الصنف..."
            className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-green-500 rounded-2xl p-5 pr-6 outline-none font-black text-xl text-slate-800 dark:text-white transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
            {['الكل', 'نقدي', 'آجل', 'مرتجع'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs whitespace-nowrap transition-all ${filter === f ? 'bg-green-600 text-white shadow-xl scale-105' : 'text-slate-500'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 no-print transform-gpu">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-green-600 text-white font-black text-sm uppercase tracking-widest">
                  <th className="p-6 text-center w-16">#</th>
                  <th className="p-6">العميل</th>
                  <th className="p-6 text-center">الصنف</th>
                  <th className="p-6 text-center">إجمالي المبلغ</th>
                  <th className="p-6 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {filteredSales.map((sale, index) => (
                  <SaleRow 
                    key={sale.id} 
                    sale={sale} 
                    index={index} 
                    onWhatsApp={handleWhatsApp} 
                    onPrint={handlePrint}
                    onReturn={handleReturn}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="pb-32"></div>
    </PageLayout>
  );
};

export default SalesList;
