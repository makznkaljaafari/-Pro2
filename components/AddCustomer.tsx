
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const AddCustomer: React.FC = () => {
  const { addCustomer, navigate } = useApp();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    
    setIsSubmitting(true);
    await addCustomer(formData);
    setIsSubmitting(false);
  };

  return (
    <PageLayout title="إضافة عميل" onBack={() => navigate('customers')} headerGradient="from-blue-600 to-indigo-700">
      <form onSubmit={handleSubmit} className="space-y-8 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-blue-50 dark:border-slate-800 space-y-10">
          <div className="flex justify-center -mt-20 mb-6">
            <div className="w-24 h-24 bg-blue-600 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-5xl text-white border-8 border-white dark:border-slate-900">👤</div>
          </div>
          <input 
            className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 font-black text-xl outline-none border-2 border-transparent focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            placeholder="اسم العميل"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input 
            type="tel"
            className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 font-black text-xl outline-none border-2 border-transparent focus:border-blue-500 transition-all text-slate-800 dark:text-white tabular-nums"
            placeholder="رقم الهاتف"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <input 
            className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 font-black text-xl outline-none border-2 border-transparent focus:border-blue-500 transition-all text-slate-800 dark:text-white"
            placeholder="العنوان (اختياري)"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-8 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all"
        >
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ بيانات العميل'}
        </button>
      </form>
    </PageLayout>
  );
};

export default AddCustomer;
