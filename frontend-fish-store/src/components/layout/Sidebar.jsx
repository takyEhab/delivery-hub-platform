import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Truck,
  Bike,
  LogOut,
  ShieldCheck,
  UserCheck,
  Fish,
  History,
  UserPlus,
  Anchor,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

export function Sidebar({ isOpen, onClose }) {
  const { user, isOwner, isDriver, logout } = useAuth();
  const { t, isRTL, language } = useLanguage();

  const navItems = isOwner
    ? [
        { label: t('nav_dashboard'), to: '/dashboard', icon: LayoutDashboard },
        { label: t('nav_orders'), to: '/orders', icon: UtensilsCrossed },
        { label: t('nav_customers'), to: '/customers', icon: Users },
        { label: t('nav_drivers'), to: '/drivers', icon: Truck },
      ]
    : [
        { label: t('nav_dashboard'), to: '/dashboard', icon: LayoutDashboard },
        { label: language === 'ar' ? 'المهام النشطة للتوصيل' : 'Active Deliveries', to: '/orders', icon: Bike },
        { label: language === 'ar' ? 'سجل جميع الطلبات' : 'Delivery History', to: '/orders/history', icon: History },
        { label: language === 'ar' ? 'إضافة وتسجيل عملاء' : 'Add Customers', to: '/driver/customers', icon: UserPlus },
      ];

  const sidebarPositionClasses = isRTL
    ? `right-0 border-l border-slate-800/80 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`
    : `left-0 border-r border-slate-800/80 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 z-40 w-64 bg-[#0B1019] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out ${sidebarPositionClasses} shadow-2xl`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center gap-3.5 border-b border-slate-800/80 shrink-0 bg-[#0E1522]">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
            <Anchor className="w-5 h-5 text-blue-400 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-white text-base tracking-tight leading-snug truncate">
              {t('store_name')}
            </span>
            <span className="text-[11px] font-medium text-slate-400 truncate">
              {isOwner ? (language === 'ar' ? 'بوابة إدارة المبيعات والتشغيل' : 'Kitchen & Dispatch Console') : t('driver_portal')}
            </span>
          </div>
        </div>

        {/* Quick Language Toggle Bar */}
        <div className="px-4 py-2 bg-[#090D15] border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            {t('language')}:
          </span>
          <LanguageToggle variant="compact" />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>{t('main_menu')}</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/orders' || item.to === '/dashboard'}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-button font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#121A28]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Subtle Kitchen Badge */}
        <div className="px-3.5 py-2.5 mx-3 mb-2 rounded-lg bg-[#0F1622] border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Fish className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{t('store_tagline')}</span>
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 shrink-0 bg-[#090D15]">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#111722] mb-2 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user?.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isOwner ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-medium">
                    <ShieldCheck className="w-3 h-3" /> {t('owner')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 font-medium">
                    <UserCheck className="w-3 h-3" /> {t('driver')}
                  </span>
                )}
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-[10px] text-slate-400 truncate font-mono" dir="ltr">
                  {user?.phone}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('sign_out')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
