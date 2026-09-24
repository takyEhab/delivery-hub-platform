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
    <div className="min-h-screen bg-[#020d1c] flex flex-col items-center justify-center p-4 text-center text-slate-100">
      <div className="w-20 h-20 rounded-3xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/10">
        <Fish className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-cyan-300 mt-1">
        {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
      </h2>
      <p className="text-sm text-slate-400 max-w-sm mt-2 mb-6">
        {language === 'ar'
          ? 'عذراً، الرابط المطلوب غير موجود أو تم نقله. يمكنك العودة للوحة التحكم الرئيسية.'
          : 'The page you requested could not be found or you may not have authorization to view it.'}
      </p>
      <Link to={homePath}>
        <Button variant="primary" icon={Home} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-0">
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Dashboard'}
        </Button>
      </Link>
    </div>
  );
}
