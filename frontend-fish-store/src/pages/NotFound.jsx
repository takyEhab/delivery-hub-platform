import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, Fish } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';

export function NotFound() {
  const { isDriver } = useAuth();
  const { t, language } = useLanguage();
  const homePath = isDriver ? '/orders' : '/dashboard';

  return (
    <div className="min-h-screen bg-[#070B12] flex flex-col items-center justify-center p-4 text-center text-slate-100">
      <div className="w-16 h-16 rounded-2xl bg-[#0F1622] border border-slate-800 text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Fish className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">404</h1>
      <h2 className="text-base font-semibold text-slate-300 mt-1">
        {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
      </h2>
      <p className="text-sm text-slate-400 max-w-sm mt-2 mb-6">
        {language === 'ar'
          ? 'عذراً، الرابط المطلوب غير موجود أو تم نقله. يمكنك العودة للوحة التحكم الرئيسية.'
          : 'The page you requested could not be found or you may not have authorization to view it.'}
      </p>
      <Link to={homePath}>
        <Button variant="primary" icon={Home}>
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Dashboard'}
        </Button>
      </Link>
    </div>
  );
}
