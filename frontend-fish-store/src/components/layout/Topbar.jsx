import React from 'react';
import { Menu, Plus, Anchor, RotateCcw, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { LanguageToggle } from './LanguageToggle';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { resetDemoData } from '../../api/mockStorage';

export function Topbar({ onOpenSidebar, onNewOrderClick, onAddCustomerClick }) {
  const { user, isOwner, isDriver } = useAuth();
  const { t, language } = useLanguage();
  const { success } = useToast();

  const handleResetDemo = () => {
    resetDemoData();
    success(
      language === 'ar' ? 'تمت استعادة البيانات التجريبية الأولية بنجاح!' : 'Demo data reset to initial state!',
      language === 'ar' ? 'إعادة ضبط' : 'Sandbox Reset'
    );
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B1019]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 text-sm">
          <div className="flex items-center gap-2 font-semibold text-white tracking-tight">
            <span className="w-6 h-6 rounded-md bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <Anchor className="w-3.5 h-3.5" />
            </span>
            <span>{t('store_name')}</span>
          </div>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-medium text-xs">
            {isOwner ? t('operations_console') : t('nav_my_deliveries')}
          </span>
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{t('store_open')}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Sandbox Pill, Language Switcher & User pill */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Sandbox Demo Mode Pill & Reset */}
        {import.meta.env.VITE_DEMO_MODE !== 'false' && (
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="font-medium text-slate-300">{language === 'ar' ? 'عرض تجريبي' : 'Sandbox Demo'}</span>
            <button
              type="button"
              onClick={handleResetDemo}
              title={language === 'ar' ? 'استعادة البيانات التجريبية الأولية' : 'Reset Demo Data'}
              className="flex items-center gap-1 ml-1 rtl:ml-0 rtl:mr-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'ar' ? 'استعادة' : 'Reset'}</span>
            </button>
          </div>
        )}

        {/* Language Switcher */}
        <LanguageToggle variant="default" />

        {/* Create Order Button for Owner */}
        {isOwner && onNewOrderClick && (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onNewOrderClick}
            className="hidden sm:inline-flex"
          >
            {t('create_order')}
          </Button>
        )}

        {/* Add Customer Button for Driver */}
        {isDriver && onAddCustomerClick && (
          <Button
            size="sm"
            variant="outline"
            icon={UserPlus}
            onClick={onAddCustomerClick}
            className="inline-flex text-xs"
          >
            {language === 'ar' ? 'إضافة عميل' : 'Add Customer'}
          </Button>
        )}

        <div className="flex items-center gap-2.5 pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-800">
          <div className="text-right rtl:text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">
              {user?.name}
            </p>
            <p className="text-[11px] text-slate-400 font-mono" dir="ltr">{user?.phone}</p>
          </div>
          <Badge variant={isOwner ? 'success' : 'info'} size="sm">
            {isOwner ? t('owner') : t('driver')}
          </Badge>
        </div>
      </div>
    </header>
  );
}
