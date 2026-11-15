import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageToggle({ variant = 'default', className = '' }) {
  const { language, toggleLanguage } = useLanguage();
  const isArabic = language === 'ar';

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border border-slate-700/70 bg-[#0B1019] text-slate-300 hover:text-white hover:border-slate-600 ${className}`}
      >
        <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="uppercase tracking-wider">{language === 'ar' ? 'EN' : 'عربي'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-slate-700/80 bg-[#111722] hover:bg-[#161F2E] hover:border-slate-600 text-slate-200 shadow-subtle ${className}`}
    >
      <Languages className="w-4 h-4 text-blue-400" />
      <span className="font-semibold">
        {isArabic ? 'English' : 'العربية'}
      </span>
      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-blue-300 border border-slate-700">
        {language.toUpperCase()}
      </span>
    </button>
  );
}
