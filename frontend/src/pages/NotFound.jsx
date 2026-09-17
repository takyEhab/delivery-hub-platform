import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function NotFound() {
  const { isDriver } = useAuth();
  const homePath = isDriver ? '/orders' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-slate-800 mt-1">
        Page Not Found
      </h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The page you requested could not be found or you may not have authorization to view it.
      </p>
      <Link to={homePath}>
        <Button variant="primary" icon={Home}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
