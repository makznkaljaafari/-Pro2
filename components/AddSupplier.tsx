
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const AddSupplier: React.FC = () => {
  const { addSupplier, navigate } = useApp();
  const [formData, setFormData] = useState({ name: '', phone: '', region: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    addSupplier(formData);
  };

  return (
    <PageLayout title="إضافة مورد" onBack={() => navigate('suppliers')} headerGradient="from-orange-600 to-amber-700">
      <form onSubmit={handleSubmit} className="space-y-8 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-orange-50 dark:border-slate-800 space-y-8">
           <div className="flex justify-center -mt-20 mb-6">
            <div className="w-24 h-24 bg-orange-600 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-5xl text-white border-8 border-white dark:border-slate-900">📦</div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-orange-600 uppercase px-2 tracking-widest">اسم المورد / المزرعة</label>
            <input type="text" className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-xl p-5 font-black text-gray-800 dark:text-white text-xl outline-none" placeholder="مثال: مزارع خولان" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-orange-600 uppercase px-2 tracking-widest">رقم الهاتف</label>
            <input type="tel" className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-xl p-5 font-black text-gray-800 dark:text-white text-xl outline-none tabular-nums" placeholder="770000000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-orange-600 uppercase px-2 tracking-widest">المنطقة</label>
            <input type="text" className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-xl p-5 font-black text-gray-800 dark:text-white text-xl outline-none" placeholder="مثال: خولان - الطيال" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white p-8 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 border-4 border-white/10 flex items-center justify-center gap-4">
          <span>حفظ المورد</span>
          <span className="text-3xl">✅</span>
        </button>
      </form>
    </PageLayout>
  );
};

export default AddSupplier;
