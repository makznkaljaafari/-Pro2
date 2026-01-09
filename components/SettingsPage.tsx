import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

type SettingsTab = 'general' | 'finance' | 'integrations' | 'data' | 'about';

const SettingsPage: React.FC = () => {
  const { 
    navigate, 
    exchangeRates, 
    updateExchangeRates, 
    user, 
    updateUser,
    theme,
    toggleTheme,
    addNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [rates, setRates] = useState(exchangeRates);
  
  const [userData, setUserData] = useState(user || {
    agency_name: '',
    full_name: '',
    whatsapp_number: '',
    telegram_username: '',
    enable_voice_ai: false
  });

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  const tabs = [
    { id: 'general', label: 'إعدادات عامة', icon: '⚙️' },
    { id: 'finance', label: 'المالية والعملات', icon: '💱' },
    { id: 'integrations', label: 'التكاملات', icon: '🔌' },
    { id: 'data', label: 'إدارة البيانات', icon: '💾' },
    { id: 'about', label: 'عن النظام', icon: 'ℹ️' },
  ];

  const handleExport = () => {
    const data = {
      sales: JSON.parse(localStorage.getItem('sales') || '[]'),
      customers: JSON.parse(localStorage.getItem('customers') || '[]'),
      suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
      vouchers: JSON.parse(localStorage.getItem('vouchers') || '[]'),
      categories: JSON.parse(localStorage.getItem('categories') || '[]'),
      expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
      waste: JSON.parse(localStorage.getItem('waste') || '[]'),
      user: JSON.parse(localStorage.getItem('user_profile') || '{}')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `وكالة_الشويع_نسخة_احتياطية_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          if (confirm('سيتم استبدال جميع البيانات الحالية بالبيانات من الملف. هل تود الاستمرار؟')) {
            Object.keys(content).forEach(key => {
              if (key === 'user') localStorage.setItem('user_profile', JSON.stringify(content[key]));
              else localStorage.setItem(key, JSON.stringify(content[key]));
            });
            window.location.reload();
          }
        } catch (e) {
          alert('فشل في قراءة ملف النسخة الاحتياطية.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveGeneral = () => {
    updateUser(userData);
    addNotification('تم الحفظ 💾', 'تم تحديث الإعدادات العامة بنجاح.', 'success');
  };

  const applyStandardRates = () => {
    const standard = { SAR_TO_YER: 430, OMR_TO_YER: 425 };
    setRates(standard);
    updateExchangeRates(standard);
    addNotification('تم تحديث الصرف ⚡', 'تم تطبيق الأسعار القياسية (430 سعودي / 425 عماني)', 'success');
  };

  return (
    <PageLayout title="إعدادات النظام" onBack={() => navigate('dashboard')} headerGradient="from-slate-700 via-slate-800 to-slate-950">
      <div className="space-y-6 pt-2 page-enter max-w-2xl mx-auto">
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-md scale-105' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden min-h-[400px]">
          
          {activeTab === 'general' && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">اسم الوكالة</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl font-black text-lg outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                    value={userData.agency_name}
                    onChange={e => setUserData({...userData, agency_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">اسم المدير / المحاسب</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl font-black text-lg outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                    value={userData.full_name}
                    onChange={e => setUserData({...userData, full_name: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleSaveGeneral}
                  className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
                >
                  حفظ التعديلات ✅
                </button>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
                <button 
                  onClick={toggleTheme}
                  className="w-full bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl flex items-center justify-between group active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{theme === 'light' ? '🌙' : '☀️'}</span>
                    <div className="text-right">
                       <p className="font-black text-slate-800 dark:text-white">تغيير وضع المظهر</p>
                       <p className="text-xs text-slate-400 font-bold">التبديل بين الليلي والنهاري</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg">💬</div>
                    <div>
                      <h4 className="font-black text-emerald-900 dark:text-emerald-300">واتساب</h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">رقم الواتساب الافتراضي</label>
                    <input 
                      type="tel" 
                      className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl font-black text-sm outline-none tabular-nums text-slate-800 dark:text-white"
                      value={userData.whatsapp_number || ''}
                      onChange={e => setUserData({...userData, whatsapp_number: e.target.value})}
                    />
                  </div>
               </div>

               <div className="bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg">🤖</div>
                      <div>
                        <h4 className="font-black text-indigo-900 dark:text-indigo-300">الردود الصوتية الذكية</h4>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={userData.enable_voice_ai || false}
                        onChange={e => setUserData({...userData, enable_voice_ai: e.target.checked})}
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
               </div>

               <button 
                  onClick={handleSaveGeneral}
                  className="w-full bg-slate-900 dark:bg-emerald-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
                >
                  حفظ إعدادات الربط ⚡
                </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="space-y-4">
                 <h4 className="font-black text-slate-900 dark:text-white px-2 flex items-center gap-2">
                   <span>📱</span> التصدير والاستيراد (الهاتف)
                 </h4>
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={handleExport}
                     className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 p-6 rounded-3xl font-black flex flex-col items-center gap-3 transition-all active:scale-95"
                   >
                     <span className="text-3xl">📤</span>
                     <span className="text-sm">تصدير للهاتف</span>
                   </button>

                   <div className="relative">
                     <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                     <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 text-blue-700 dark:text-blue-400 p-6 rounded-3xl font-black flex flex-col items-center gap-3 transition-all">
                       <span className="text-3xl">📥</span>
                       <span className="text-sm">استيراد ملف</span>
                     </div>
                   </div>
                 </div>
               </section>

               <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                 <button 
                   onClick={() => {
                     if (confirm('تحذير: هذا الإجراء سيقوم بحذف جميع المبيعات والعملاء والبيانات نهائياً ولا يمكن التراجع. هل أنت متأكد؟')) {
                       localStorage.clear();
                       window.location.reload();
                     }
                   }}
                   className="w-full border-2 border-red-200 text-red-400 p-5 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all"
                 >
                   تصفير النظام ومسح جميع السجلات ⚠️
                 </button>
               </div>
            </div>
          )}

          {activeTab === 'finance' && (
             <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 mb-2">
                <button 
                  onClick={applyStandardRates}
                  className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-emerald-500 text-emerald-600 font-black text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  تطبيق الأسعار القياسية (430 / 425)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">السعودي مقابل اليمني</label>
                  </div>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl font-black text-3xl text-center outline-none border-2 border-transparent focus:border-emerald-500 tabular-nums text-slate-800 dark:text-white shadow-inner" 
                    value={rates.SAR_TO_YER} 
                    onChange={e => setRates({...rates, SAR_TO_YER: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">العماني مقابل اليمني</label>
                  </div>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl font-black text-3xl text-center outline-none border-2 border-transparent focus:border-emerald-500 tabular-nums text-slate-800 dark:text-white shadow-inner" 
                    value={rates.OMR_TO_YER} 
                    onChange={e => setRates({...rates, OMR_TO_YER: parseFloat(e.target.value) || 0})} 
                  />
                </div>
              </div>
              <button 
                onClick={() => updateExchangeRates(rates)} 
                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
              >
                تحديث الأسعار المخصصة ⚡
              </button>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="p-10 space-y-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-center">
                 <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-2xl animate-logo-float border-4 border-white dark:border-slate-800">🌿</div>
              </div>
              <div className="space-y-4">
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white">وكاله الشويع للقات</h2>
                 <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-sm mx-auto">
                   نظام إدارة مبيعات القات الأول في اليمن.
                 </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl space-y-6">
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">تطوير وتصميم</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">عبدالكريم الجعفري</p>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <div className="pb-40"></div>
    </PageLayout>
  );
};

export default SettingsPage;