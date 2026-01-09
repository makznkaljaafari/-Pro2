
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const AddPurchase: React.FC = () => {
  const { addPurchase, navigate, suppliers, categories } = useApp();
  const [formData, setFormData] = useState({
    supplier_id: '',
    qat_type: categories[0]?.name || 'برعي',
    quantity: 1,
    unit_price: 0,
    status: 'نقدي' as 'نقدي' | 'آجل',
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: ''
  });

  const quickPrices = [1000, 2000, 3000, 5000, 10000, 15000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find(s => s.id === formData.supplier_id);
    if (!supplier) {
      alert('يرجى اختيار المورد');
      return;
    }
    if (formData.unit_price <= 0) {
      alert('يرجى تحديد سعر الشراء');
      return;
    }

    addPurchase({
      ...formData,
      supplier_name: supplier.name,
      total: formData.quantity * formData.unit_price
    });
  };

  const adjustQty = (amount: number) => {
    setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity + amount) }));
  };

  return (
    <PageLayout title="فاتورة شراء جديدة" onBack={() => navigate('purchases')} headerGradient="from-orange-600 to-amber-800">
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-md mx-auto">
        {/* Currency Selector */}
        <div className="flex bg-white dark:bg-slate-900 rounded-[2rem] p-2 shadow-sm border border-gray-100 dark:border-slate-800">
           {['YER', 'SAR', 'OMR'].map((cur) => (
             <button
               key={cur}
               type="button"
               onClick={() => setFormData({...formData, currency: cur as any})}
               className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${
                 formData.currency === cur 
                   ? 'bg-amber-600 text-white shadow-lg' 
                   : 'text-gray-400 dark:text-slate-500 hover:text-amber-600'
               }`}
             >
               {cur === 'YER' ? 'يمني' : cur === 'SAR' ? 'سعودي' : 'عماني'}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 dark:text-white uppercase px-2 tracking-widest">المورد / المزارع</label>
            <select 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-500 rounded-xl p-4 font-black text-gray-800 dark:text-white text-lg outline-none appearance-none"
              value={formData.supplier_id}
              onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
              required
            >
              <option value="">-- اختر المورد --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 dark:text-white uppercase px-2 tracking-widest">نوع القات</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, qat_type: cat.name })}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl font-black text-sm transition-all border-2 ${
                    formData.qat_type === cat.name 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-lg' 
                      : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-white border-gray-100 dark:border-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800">
          <label className="text-xs font-black text-gray-400 dark:text-white uppercase px-2 tracking-widest block mb-4">الكمية المشتراة</label>
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => adjustQty(-1)} className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-black text-gray-600 dark:text-white active:scale-90">－</button>
            <input type="number" className="flex-1 bg-transparent text-center font-black text-gray-800 dark:text-white text-4xl outline-none tabular-nums" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
            <button type="button" onClick={() => adjustQty(1)} className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-black text-gray-600 dark:text-white active:scale-90">＋</button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800">
          <label className="text-xs font-black text-gray-400 dark:text-white uppercase px-2 tracking-widest block mb-4">تكلفة الشراء ({formData.currency})</label>
          <input type="number" className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-500 rounded-2xl p-5 font-black text-gray-800 dark:text-white text-center text-4xl outline-none tabular-nums mb-4" value={formData.unit_price || ''} placeholder="0.00" onChange={e => setFormData({ ...formData, unit_price: parseInt(e.target.value) || 0 })} />
          <div className="grid grid-cols-3 gap-2">
            {quickPrices.map(p => (
              <button key={p} type="button" onClick={() => setFormData({...formData, unit_price: p})} className="bg-gray-100 dark:bg-slate-800 hover:bg-amber-600 hover:text-white dark:text-white py-3 rounded-xl text-sm font-black transition-all border border-transparent dark:border-slate-700">{p.toLocaleString()}</button>
            ))}
          </div>
        </div>

        <div className="flex bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-slate-800 h-16">
          <button type="button" onClick={() => setFormData({ ...formData, status: 'نقدي' })} className={`flex-1 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${formData.status === 'نقدي' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 dark:text-white opacity-40'}`}>💵 نقدي</button>
          <button type="button" onClick={() => setFormData({ ...formData, status: 'آجل' })} className={`flex-1 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${formData.status === 'آجل' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 dark:text-white opacity-40'}`}>⏳ آجل</button>
        </div>

        <div className="bg-gray-900 dark:bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/10">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">إجمالي التكلفة</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tabular-nums">{(formData.quantity * formData.unit_price).toLocaleString()}</span>
                <span className="text-sm opacity-60 font-bold">{formData.currency}</span>
              </div>
            </div>
            <button type="submit" className="bg-amber-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20">
              <span>حفظ الشراء</span>
              <span className="text-2xl">📥</span>
            </button>
          </div>
        </div>
        <div className="pb-32"></div>
      </form>
    </PageLayout>
  );
};

export default AddPurchase;
