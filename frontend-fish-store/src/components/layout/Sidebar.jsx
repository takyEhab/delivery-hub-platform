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
  Waves,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

export function Sidebar({ isOpen, onClose }) {
  const { user, isOwner, isDriver, logout } = useAuth();
  const { t, isRTL } = useLanguage();

  const navItems = isOwner
    ? [
        { label: t('nav_dashboard'), to: '/dashboard', icon: LayoutDashboard },
        { label: t('nav_orders'), to: '/orders', icon: UtensilsCrossed },
        { label: t('nav_customers'), to: '/customers', icon: Users },
        { label: t('nav_drivers'), to: '/drivers', icon: Truck },
      ]
    : [
        { label: t('nav_my_deliveries'), to: '/orders', icon: Bike },
      ];

  const sidebarPositionClasses = isRTL
    ? `right-0 border-l border-cyan-900/30 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`
    : `left-0 border-r border-cyan-900/30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 z-40 w-64 bg-[#051528] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out ${sidebarPositionClasses} shadow-2xl`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center gap-3 border-b border-cyan-950/80 shrink-0 bg-gradient-to-b from-[#08203c] to-[#051528]">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 border border-cyan-300/30 shrink-0">
            <Fish className="w-6 h-6 text-white stroke-[2.2]" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#051528] animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight leading-none truncate">
                {t('store_name')}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-cyan-400 mt-1 truncate">
              {isOwner ? t('operations_console') : t('driver_portal')}
            </span>
          </div>
        </div>

        {/* Quick Language Toggle Bar */}
        <div className="px-4 py-2.5 bg-[#030e1a]/80 border-b border-cyan-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            {t('language')}:
          </span>
          <LanguageToggle variant="compact" />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest flex items-center gap-1.5">
            <Waves className="w-3 h-3 text-cyan-500" />
            <span>{t('main_menu')}</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/25 to-sky-600/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Store Quality Tag */}
        <div className="px-3 py-2 mx-3 mb-2 rounded-xl bg-cyan-950/40 border border-cyan-800/30 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('store_tagline')}</span>
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-cyan-950/80 shrink-0 bg-[#020b14]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 mb-2 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-700 to-ocean-800 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-snug">
                {user?.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isOwner ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> {t('owner')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 font-semibold">
                    <UserCheck className="w-3 h-3" /> {t('driver')}
                  </span>
                )}
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-[10px] text-slate-400 truncate" dir="ltr">
                  {user?.phone}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('sign_out')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
