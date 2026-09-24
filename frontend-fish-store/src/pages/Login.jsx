import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/layout/LanguageToggle';
import {
  Fish,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Bike,
  Sparkles,
  Waves,
  Anchor,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number');
      return;
    }
    if (!password) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(phone.trim(), password);
      const welcomeMsg = language === 'ar'
        ? `أهلاً بك مجدداً، ${data.user.name}!`
        : `Welcome back, ${data.user.name}!`;
      success(welcomeMsg, language === 'ar' ? 'تم تسجيل الدخول' : 'Signed In');

      // Determine redirect target based on user role
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else if (data.user.role === 'owner') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/orders', { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for review and testing
  const handleQuickFill = (testPhone, testPass) => {
    setPhone(testPhone);
    setPassword(testPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#020d1c] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing ocean aurora */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-cyan-500/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[350px] bg-ocean-500/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[300px] bg-teal-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Language Switcher Float on Top */}
      <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6 z-20">
        <LanguageToggle variant="default" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand logo & title */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30 mb-4 border border-cyan-300/40 transform transition-transform duration-300 group-hover:scale-105">
              <Fish className="w-11 h-11 text-white stroke-[2.2]" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{t('store_name')}</span>
          </h1>
          <p className="text-sm font-semibold text-cyan-400 mt-1">
            {t('store_name_en')}
          </p>
          <p className="mt-1.5 text-xs text-slate-400 max-w-xs">
            {t('login_subheading')}
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-7 bg-[#051528]/80 backdrop-blur-2xl py-8 px-6 sm:px-8 rounded-3xl border border-cyan-800/40 shadow-2xl shadow-black/80">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">{language === 'ar' ? 'تنبيه:' : 'Error:'}</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-slate-300 mb-1.5"
              >
                {t('phone_label')}
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5">
                  <Phone className="h-4 w-4 text-cyan-400/80" />
                </div>
                <input
                  id="phone"
                  type="text"
                  autoComplete="tel"
                  placeholder="01007479928"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/70 text-sm text-white placeholder:text-slate-500 pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-300 mb-1.5"
              >
                {t('password_label')}
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5">
                  <Lock className="h-4 w-4 text-cyan-400/80" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700/80 bg-[#020b14]/70 text-sm text-white placeholder:text-slate-500 pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25 border-0 py-3 rounded-xl transition-all"
            >
              {t('sign_in_button')}
            </Button>
          </form>

          {/* Preset quick test accounts section */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] font-bold text-cyan-400/90 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
              <Waves className="w-3.5 h-3.5" />
              <span>{t('demo_accounts_title')}</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('01007479928', 'changeme123')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#031120] border border-cyan-900/50 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-950/40 transition-all text-center"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold truncate">{t('demo_owner')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('0501112233', 'driver123')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#031120] border border-sky-900/50 text-slate-200 hover:text-sky-300 hover:border-sky-500/50 hover:bg-sky-950/40 transition-all text-center"
              >
                <Bike className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-semibold truncate">{t('demo_driver')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
