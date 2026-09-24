import React from 'react';
import { Menu, Plus, Fish, Waves, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function Topbar({ onOpenSidebar, onNewOrderClick }) {
  const { user, isOwner } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#051528]/90 backdrop-blur-nav border-b border-cyan-900/30 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 text-sm">
          <div className="flex items-center gap-1.5 font-bold text-white tracking-tight">
            <Fish className="w-4 h-4 text-cyan-400" />
            <span>{t('store_name')}</span>
          </div>
          <span className="text-cyan-800">/</span>
          <span className="text-cyan-300 font-semibold text-xs">
            {isOwner ? t('operations_console') : t('nav_my_deliveries')}
          </span>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('store_open')}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Language Switcher & User pill */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageToggle variant="default" />

        {/* Create Order Button */}
        {isOwner && onNewOrderClick && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onNewOrderClick}
            className="hidden sm:inline-flex bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 border-0"
          >
            {t('create_order')}
          </Button>
        )}

        <div className="flex items-center gap-2.5 pl-2 rtl:pl-0 rtl:pr-2 border-l rtl:border-l-0 rtl:border-r border-slate-800">
          <div className="text-right rtl:text-left hidden sm:block">
            <p className="text-xs font-bold text-white leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-400" dir="ltr">{user?.phone}</p>
          </div>
          <Badge variant={isOwner ? 'success' : 'info'} size="sm" dot>
            {isOwner ? t('owner') : t('driver')}
          </Badge>
        </div>
      </div>
    </header>
  );
}
