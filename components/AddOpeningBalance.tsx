
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const AddOpeningBalance: React.FC = () => {
  const { addSale, addPurchase, navigate, customers, suppliers } = useApp();
  
  const [formData, setFormData] = useState({
    person_type: 'عميل' as 'عميل' | 'مورد',
    person_id: '',
    amount: 0,
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: 'رصيد افتتاحي (دين سابق)'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person_id || formData.amount <= 0) {
      alert('يرجى اختيار الشخص وتحديد المبلغ');
      return;
    }

    if (formData.person_type === 'عميل') {
      const customer = customers.find(c => c.id === formData.person_id);
      if (customer) {
        addSale({
          customer_id: customer.id,
          customer_name: customer.name,
          qat_type: 'رصيد افتتاحي',
          quantity: 0,
          unit_price: 0,
          total: formData.amount,
          status: 'آجل',
          currency: formData.currency,
          notes: formData.notes
        });
        alert('تم تسجيل مديونية سابقة للعميل بنجاح');
      }
    } else {
      const supplier = suppliers.find(s => s.id === formData.person_id);
      if (supplier) {
        addPurchase({
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          qat_type: 'رصيد افتتاحي',
          quantity: 0,
          unit_price: 0,
          total: formData.amount,
          status: 'آجل',
          currency: formData.currency,
          notes: formData.notes
        });
        alert('تم تسجيل مديونية سابقة للمورد بنجاح');
      }
    }
    navigate('debts');
  };

  const currentSelectionList = formData.person_type === 'عميل' ? customers : suppliers;

  return (
    <PageLayout 
      title="إضافة رصيد أول المدة" 
      onBack={() => navigate('debts')} 
      headerGradient="from-slate-800 to-slate-900"
    >
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-8 transition-colors">
          <div className="flex justify-center -mt-20 mb-6">
            <div className="w-24 h-24 bg-slate-800 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-5xl text-white border-8 border-white dark:border-slate-900">
              📜
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-2xl">
            <button 
              type="button" 
              onClick={() => setFormData({ ...formData, person_type: 'عميل', person_id: '' })}
              className={`py-3 rounded-xl font-black text-sm transition-all ${formData.person_type === 'عميل' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
            >
              مديونية عميل (لنا)
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({ ...formData, person_type: 'مورد', person_id: '' })}
              className={`py-3 rounded-xl font-black text-sm transition-all ${formData.person_type === 'مورد' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
            >
              مديونية مورد (علينا)
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">اختيار {formData.person_type}</label>
            <select 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-xl p-5 font-black text-gray-800 dark:text-white text-lg outline-none appearance-none transition-all"
              value={formData.person_id}
              onChange={e => setFormData({ ...formData, person_id: e.target.value })}
              required
            >
              <option value="">-- اختر من القائمة --</option>
              {currentSelectionList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">المبلغ المستحق ({formData.currency})</label>
            <input 
              type="number" 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-black text-center text-5xl outline-none tabular-nums transition-all text-red-600 dark:text-red-400"
              value={formData.amount || ''}
              placeholder="0"
              onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-600 dark:text-slate-400 px-2 block uppercase">العملة</label>
            <div className="flex gap-2 p-1 bg-gray-50 dark:bg-slate-800 rounded-2xl">
              {['YER', 'SAR', 'OMR'].map(cur => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setFormData({...formData, currency: cur as any})}
                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                    formData.currency === cur 
                      ? 'bg-slate-800 text-white shadow-lg' 
                      : 'text-gray-400'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">البيان / ملاحظات</label>
            <textarea 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 font-black text-gray-800 dark:text-white text-lg outline-none transition-all"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-slate-900 text-white p-8 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 border-4 border-white/10 flex items-center justify-center gap-4 transition-all"
        >
          <span>حفظ الرصيد السابق</span>
          <span className="text-3xl">✅</span>
        </button>
      </form>
    </PageLayout>
  );
};

export default AddOpeningBalance;
