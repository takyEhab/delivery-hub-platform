import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';
import { useToast } from '../hooks/useToast';
import { Truck, Lock, Phone, ArrowRight, ShieldCheck, Bike } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(phone.trim(), password);
      success(`Welcome back, ${data.user.name}!`, 'Signed In');

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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand logo & title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4 border border-emerald-400/30">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            DeliveryHub
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Operations & delivery management console
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-800/80 backdrop-blur-xl py-8 px-6 sm:px-8 rounded-2xl border border-slate-700/80 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative rounded-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="phone"
                  type="text"
                  autoComplete="tel"
                  placeholder="e.g. 0500000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 text-sm text-white placeholder:text-slate-500 pl-9 pr-3 py-2.5 transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900/60 text-sm text-white placeholder:text-slate-500 pl-9 pr-3 py-2.5 transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
            >
              Sign In to Console
            </Button>
          </form>

          {/* Preset quick test accounts section */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Fill Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('01007479928', 'changeme123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-all text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Owner Account</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('0501112233', 'driver123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-sky-400 hover:border-sky-500/50 transition-all text-left"
              >
                <Bike className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Driver Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
