
import React, { memo } from 'react';
import { useApp } from '../../context/AppContext';

interface LayoutProps {
  title: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  headerGradient?: string;
}

const LocalStorageIndicator = memo(() => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80">
    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
    <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
      تخزين محلي آمن 💾
    </span>
  </div>
));

const QatLogo = memo(() => (
  <div className="relative w-16 h-16 flex items-center justify-center bg-white/20 rounded-[1.8rem] border border-white/30 shadow-xl overflow-hidden group animate-logo-float animate-border-pulse transform-gpu">
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 via-transparent to-lime-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <svg viewBox="0 0 40 40" className="w-12 h-12 text-white fill-current drop-shadow-lg transform-gpu transition-transform duration-500 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38C20 38 20 22 20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M20 6C20 6 25 2 28 6C31 10 26 14 20 13C14 14 9 10 12 6C15 2 20 6 20 6Z" className="fill-white" />
      <path d="M21 15C21 15 32 10 35 15C38 20 31 24 21 22C11 24 4 20 7 15C10 10 21 15 21 15Z" className="fill-emerald-100" opacity="0.95" />
      <path d="M20 23C20 23 34 19 37 25C40 31 32 35 20 33C8 35 0 31 3 25C6 19 20 23 20 23Z" className="fill-emerald-200" opacity="0.85" />
    </svg>
    <div className="absolute inset-0 shine-effect pointer-events-none opacity-30"></div>
  </div>
));

export const PageLayout: React.FC<LayoutProps> = ({ 
  title, 
  headerExtra, 
  children, 
  onBack,
  headerGradient = "from-green-600 via-emerald-600 to-teal-700 dark:from-green-900 dark:via-slate-900 dark:to-slate-950" 
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="sticky top-0 z-30 w-full px-3 pt-3">
        <header className={`relative overflow-hidden bg-gradient-to-br ${headerGradient} text-white px-6 py-8 rounded-[3rem] shadow-2xl border border-white/20 transform-gpu`}>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-6">
              {onBack ? (
                <button onClick={onBack} className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-4xl transition-all active:scale-90 border border-white/10 shadow-lg transform-gpu">
                  <span className="translate-x-[1px]">→</span>
                </button>
              ) : (
                <QatLogo />
              )}
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight animate-text-shimmer leading-tight drop-shadow-md">
                  {title}
                </h1>
                <div className="flex items-center gap-2">
                   <LocalStorageIndicator />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {headerExtra}
            </div>
          </div>
        </header>
      </div>
      <main className="flex-1 p-5 pb-52 overflow-y-auto no-scrollbar transform-gpu">
        {children}
      </main>
    </div>
  );
};
