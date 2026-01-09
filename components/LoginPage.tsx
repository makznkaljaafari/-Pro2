
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const LoginPage: React.FC = () => {
  const { loginAction, registerAction, theme } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agencyName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الخير، أهلاً بك في وكالة الشويع ☀️');
    else if (hour < 18) setGreeting('طاب يومك، رزقكم الله من واسع فضله 🍃');
    else setGreeting('مساء الخير، عساكم بخير وعافية ✨');
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    await new Promise(r => setTimeout(r, 1000));

    try {
      if (isRegister) {
        if (!formData.agencyName || !formData.fullName || !formData.identifier || !formData.password) {
          setError('يرجى إكمال جميع الحقول المطلوبة');
          setIsLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('كلمات المرور غير متطابقة');
          setIsLoading(false);
          return;
        }
        await registerAction({
          agencyName: formData.agencyName,
          fullName: formData.fullName,
          email: formData.identifier,
          password: formData.password
        });
      } else {
        if (!formData.identifier || !formData.password) {
          setError('يرجى إدخال بيانات الدخول');
          setIsLoading(false);
          return;
        }
        await loginAction(formData.identifier, formData.password);
      }
    } catch (err) {
      setError('عذراً، تأكد من البيانات المدخلة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-all duration-700 ${theme === 'dark' ? 'bg-slate-950' : 'bg-emerald-50'}`}>
      
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-2xl relative z-10 page-enter">
        <div className="text-center mb-12">
          <div className="relative inline-block group mb-6">
            <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl mx-auto border-8 border-white dark:border-slate-800 animate-logo-float relative z-10">
              🌿
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter drop-shadow-lg">وكالة الشويع للقات</h1>
          <p className="text-slate-500 dark:text-emerald-400 font-black text-lg px-8 italic">
            {isRegister ? 'أنشئ حساباً جديداً لإدارة وكالتك' : greeting}
          </p>
        </div>

        <div className="glass dark:bg-slate-900/80 p-2 rounded-[3.5rem] shadow-2xl border border-white/40 dark:border-slate-800 overflow-hidden">
          <div className="bg-white/40 dark:bg-slate-900/40 p-10 md:p-14 rounded-[3rem] border border-white/20">
            
            <div className="flex bg-gray-200/50 dark:bg-slate-800/50 p-2 rounded-2xl mb-10 relative">
              <div 
                className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-white dark:bg-slate-700 rounded-xl shadow-lg transition-all duration-500 transform-gpu ${isRegister ? 'translate-x-[-100%]' : 'translate-x-0'}`}
              ></div>
              <button 
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 py-4 rounded-xl font-black text-sm relative z-10 transition-colors duration-300 ${!isRegister ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                تسجيل الدخول
              </button>
              <button 
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 py-4 rounded-xl font-black text-sm relative z-10 transition-colors duration-300 ${isRegister ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                حساب جديد
              </button>
            </div>

            <form onSubmit={handleAction} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-5 rounded-2xl text-xs font-black text-center border-2 border-red-100 dark:border-red-800/30 animate-shake">
                  🚫 {error}
                </div>
              )}

              <div className="space-y-5">
                {isRegister && (
                  <>
                    <div className="relative">
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30">🏢</span>
                      <input 
                        type="text" 
                        className="w-full bg-white dark:bg-slate-800/80 border-4 border-transparent focus:border-emerald-500 rounded-2xl p-6 pr-16 font-black text-xl text-slate-800 dark:text-white outline-none transition-all shadow-md"
                        placeholder="اسم الوكالة"
                        value={formData.agencyName}
                        onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30">📱</span>
                  <input 
                    type="text" 
                    className="w-full bg-white dark:bg-slate-800/80 border-4 border-transparent focus:border-emerald-500 rounded-2xl p-6 pr-16 font-black text-xl text-slate-800 dark:text-white outline-none transition-all shadow-md"
                    placeholder="رقم الهاتف أو المعرف"
                    value={formData.identifier}
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    required
                  />
                </div>

                <div className="relative">
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30">🔒</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-white dark:bg-slate-800/80 border-4 border-transparent focus:border-emerald-500 rounded-2xl p-6 pr-16 font-black text-xl text-slate-800 dark:text-white outline-none transition-all shadow-md"
                    placeholder="كلمة المرور"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full group relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white p-6 rounded-[2rem] font-black text-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 border-b-8 border-emerald-800 mt-8`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جاري التحقق...</span>
                  </div>
                ) : (
                  <>
                    <span>{isRegister ? 'بدء العمل الآن' : 'دخول النظام'}</span>
                    <span className="text-3xl transition-transform group-hover:scale-125">⚡</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
