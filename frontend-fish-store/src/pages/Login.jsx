import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/layout/LanguageToggle';
import {
  Anchor,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Bike,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();

  const from = location.state?.from?.pathname;

  // If already logged in, redirect straight to /dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click instant login helper for portfolio recruiters and reviewers
  const handleQuickLogin = async (testPhone, testPass) => {
    setPhone(testPhone);
    setPassword(testPass);
    setError('');
    setIsLoading(true);
    try {
      const data = await login(testPhone, testPass);
      const welcomeMsg = language === 'ar'
        ? `أهلاً بك، ${data.user.name}!`
        : `Welcome, ${data.user.name}!`;
      success(welcomeMsg, language === 'ar' ? 'تم تسجيل الدخول التجريبي' : 'Demo Login');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher Float on Top */}
      <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6 z-20">
        <LanguageToggle variant="default" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand logo & title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-sm">
            <Anchor className="w-7 h-7 stroke-[2]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t('store_name')}
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest font-mono">
            {t('store_name_en')}
          </p>
          <p className="mt-1 text-xs text-slate-400 max-w-xs">
            {t('login_subheading')}
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-[#0F1622] py-8 px-6 sm:px-8 rounded-2xl border border-slate-800/80 shadow-card">
          {error && (
            <div className="mb-5 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <span className="font-semibold">{language === 'ar' ? 'تنبيه:' : 'Error:'}</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                {t('phone_label')}
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5 text-slate-500">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  type="text"
                  autoComplete="tel"
                  placeholder="01097132814"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700/80 bg-[#0B1019] text-sm text-white placeholder:text-slate-500 pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-2.5 transition-colors focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                {t('password_label')}
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3.5 rtl:pl-0 rtl:pr-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700/80 bg-[#0B1019] text-sm text-white placeholder:text-slate-500 pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-2.5 transition-colors focus:border-blue-500 focus:outline-none"
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
              className="w-full mt-2"
            >
              {t('sign_in_button')}
            </Button>
          </form>

          {/* Preset quick test accounts section */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              {t('demo_accounts_title')}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('01097132814', 'changeme123')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0B1019] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-center cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium truncate">{t('demo_owner')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('0501112233', 'driver123')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0B1019] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-center cursor-pointer disabled:opacity-50"
              >
                <Bike className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-medium truncate">{t('demo_driver')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
