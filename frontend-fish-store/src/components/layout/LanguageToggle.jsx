import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageToggle({ variant = 'default', className = '' }) {
  const { language, toggleLanguage, t } = useLanguage();

  const isArabic = language === 'ar';

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
          isArabic
            ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60 hover:bg-cyan-900/60'
            : 'bg-ocean-900/60 text-ocean-200 border-ocean-700/60 hover:bg-ocean-800/60'
        } ${className}`}
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="uppercase tracking-wider">{language === 'ar' ? 'EN' : 'عربي'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
        isArabic
          ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/30 hover:bg-cyan-900/50 hover:border-cyan-400/50 shadow-sm shadow-cyan-950/30'
          : 'bg-slate-800/60 text-slate-200 border-slate-700/60 hover:bg-slate-800 hover:border-cyan-500/30'
      } ${className}`}
    >
      <Languages className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
      <span className="font-bold tracking-tight">
        {isArabic ? 'English' : 'العربية'}
      </span>
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
        {language.toUpperCase()}
      </span>
    </button>
  );
}
