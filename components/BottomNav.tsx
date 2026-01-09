
import React, { memo } from 'react';
import { useApp } from '../context/AppContext';

const BottomNav: React.FC = () => {
  const { currentPage, navigate } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
    { id: 'sales', label: 'المبيعات', icon: '💰' },
    { id: 'add-sale', label: 'إضافة', icon: '＋', primary: true },
    { id: 'debts', label: 'الحسابات', icon: '⚖️' },
    { id: 'customers', label: 'العملاء', icon: '👥' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-2 pb-8 pt-4 flex justify-around items-center z-50 rounded-t-[2.5rem] shadow-[0_-15px_35px_-5px_rgba(0,0,0,0.1)] transition-colors duration-300 transform-gpu">
      {navItems.map((item) => (
        <button 
          key={item.id}
          onClick={() => navigate(item.id as any)}
          className={`flex flex-col items-center gap-1.5 transition-all duration-200 relative transform-gpu ${
            item.primary 
              ? '-mt-16' 
              : currentPage === item.id 
                ? 'text-green-600 dark:text-green-400 scale-105' 
                : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {item.primary ? (
            <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-3xl text-white shadow-xl border-4 border-white dark:border-slate-800 active:scale-90 transition-transform transform-gpu">
              {item.icon}
            </div>
          ) : (
            <>
              <span className={`text-2xl transition-transform transform-gpu ${currentPage === item.id ? 'scale-110' : 'opacity-70'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-black transition-all ${currentPage === item.id ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.label}
              </span>
              {currentPage === item.id && (
                <span className="absolute -bottom-3 w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></span>
              )}
            </>
          )}
        </button>
      ))}
    </nav>
  );
};

export default memo(BottomNav);
