
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatSaleInvoice } from '../services/shareService';

const AddSale: React.FC = () => {
  const { customers, categories, addSale, navigate, navigationParams, saleTemplates, addSaleTemplate, deleteSaleTemplate, addNotification, user, exchangeRates } = useApp();
  const [formData, setFormData] = useState({
    customer_id: navigationParams?.customerId || '',
    qat_type: categories[0]?.name || 'برعي',
    quantity: 1,
    unit_price: 0,
    status: 'نقدي' as 'نقدي' | 'آجل',
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: ''
  });

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [shareAfterSave, setShareAfterSave] = useState(true);

  const equivalentInYER = formData.currency === 'SAR' 
    ? formData.unit_price * exchangeRates.SAR_TO_YER 
    : formData.currency === 'OMR' 
      ? formData.unit_price * exchangeRates.OMR_TO_YER 
      : formData.unit_price;

  useEffect(() => {
    if (navigationParams?.customerId) {
      setFormData(prev => ({ ...prev, customer_id: navigationParams.customerId }));
    }
  }, [navigationParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customer_id);
    
    if (!customer) {
      addNotification("خطأ في العميل ⚠️", "يرجى اختيار العميل أولاً", "warning");
      return;
    }
    if (formData.unit_price <= 0) {
      addNotification("خطأ في السعر ⚠️", "يرجى تحديد السعر بشكل صحيح", "warning");
      return;
    }

    const total = formData.quantity * formData.unit_price;
    const saleData = {
      ...formData,
      customer_name: customer.name,
      total: total,
      date: new Date().toISOString()
    };

    addSale(saleData);

    if (saveAsTemplate && templateName) {
      addSaleTemplate({
        name: templateName,
        qat_type: formData.qat_type,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        currency: formData.currency
      });
    }

    if (shareAfterSave) {
      const text = formatSaleInvoice(saleData as any, user?.agency_name || 'وكالة الشويع');
      shareToWhatsApp(text, customer.phone);
    }
  };

  const applyTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      qat_type: template.qat_type,
      quantity: template.quantity,
      unit_price: template.unit_price,
      currency: template.currency
    }));
    addNotification("تم تطبيق القالب ⚡", template.name, "info");
  };

  const adjustQty = (amount: number) => {
    setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity + amount) }));
  };

  return (
    <PageLayout title="فاتورة مبيعات" onBack={() => navigate('dashboard')} headerGradient="from-emerald-600 to-teal-800">
      <div className="space-y-8 page-enter max-w-2xl mx-auto pb-40">
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <label className="text-md font-black text-gray-400 dark:text-white uppercase px-2 tracking-widest">اختيار العميل</label>
              <button 
                type="button" 
                onClick={() => navigate('scanner')}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-3 shadow-lg active:scale-95"
              >
                <span>الماسح</span>
                <span className="text-xl">📷</span>
              </button>
            </div>
            <select 
              className="w-full bg-gray-50 dark:bg-slate-800 border-4 border-transparent focus:border-emerald-500 rounded-[2rem] p-6 font-black text-gray-800 dark:text-white text-2xl outline-none appearance-none shadow-inner transition-all"
              value={formData.customer_id}
              onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
              required
            >
              <option value="">-- اختر العميل --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <label className="text-md font-black text-gray-400 dark:text-white uppercase px-2 tracking-widest">الكمية والسعر</label>
              {formData.currency !== 'YER' && (
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 rounded-xl text-xs font-black">
                   ≃ {equivalentInYER.toLocaleString()} ريال يمني
                </span>
              )}
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-6">
                <button type="button" onClick={() => adjustQty(-1)} className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl font-black text-gray-600 dark:text-white active:scale-90 shadow-sm">－</button>
                <div className="flex-1 text-center">
                  <input type="number" className="w-full bg-transparent text-center font-black text-gray-800 dark:text-white text-7xl outline-none tabular-nums" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Math.max(0, parseInt(e.target.value) || 0) })} />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">الكمية (أكياس)</p>
                </div>
                <button type="button" onClick={() => adjustQty(1)} className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl font-black text-gray-600 dark:text-white active:scale-90 shadow-sm">＋</button>
              </div>

              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-gray-50 dark:bg-slate-800 border-4 border-transparent focus:border-emerald-500 rounded-[2.5rem] p-10 font-black text-gray-800 dark:text-white text-center text-6xl outline-none tabular-nums shadow-inner" 
                  value={formData.unit_price || ''} 
                  placeholder="0" 
                  onChange={e => setFormData({ ...formData, unit_price: Math.max(0, parseInt(e.target.value) || 0) })} 
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 pointer-events-none uppercase">
                   {formData.currency}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 dark:bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl border border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-right space-y-1">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">إجمالي المبلغ المطلوب</p>
                <div className="flex items-baseline justify-center md:justify-start gap-3">
                  <span className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter">{(formData.quantity * formData.unit_price).toLocaleString()}</span>
                  <span className="text-2xl opacity-60 font-bold uppercase">{formData.currency}</span>
                </div>
              </div>
              <button type="submit" className="w-full md:w-auto bg-emerald-600 text-white px-12 py-8 rounded-[2rem] font-black text-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 border-b-8 border-emerald-800">
                <span>حفظ وواتساب</span>
                <span className="text-4xl">⚡</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default AddSale;
