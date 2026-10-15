import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listOrders } from '../api/orders';
import { baseURL } from '../api/client';
import { useLanguage } from './LanguageContext';
import { Bike, Bell, X, ExternalLink, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const CourierNotificationContext = createContext(null);

/**
 * Web Audio API synthesized delivery notification chime
 * Two-tone pleasant oceanic chime (D5 -> A5)
 */
function playCourierChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // First tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone higher (880 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.16);
    gain2.gain.setValueAtTime(0.32, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.debug('Notification audio skipped:', e);
  }
}

export function CourierNotificationProvider({ children }) {
  const { isAuthenticated, isDriver, user, token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeNotification, setActiveNotification] = useState(null);
  const knownOrderIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  // Request browser notification permission once driver logs in
  useEffect(() => {
    if (isAuthenticated && isDriver && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [isAuthenticated, isDriver]);

  // Main listener effect: only runs when courier is logged in.
  // COMPLETELY terminates and cleans up when courier logs out!
  useEffect(() => {
    // If not logged in as a driver, clear any notification and do nothing!
    if (!isAuthenticated || !isDriver || !user || !token) {
      setActiveNotification(null);
      knownOrderIdsRef.current.clear();
      initializedRef.current = false;
      return;
    }

    let isMounted = true;
    let eventSource = null;

    // Handle a newly assigned order
    const triggerOrderNotification = (order) => {
      if (!order || !order.id) return;
      if (knownOrderIdsRef.current.has(order.id)) return;
      knownOrderIdsRef.current.add(order.id);

      // Play audio chime
      playCourierChime();

      // Set active in-app banner
      setActiveNotification(order);

      // System / browser native notification
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = language === 'ar'
            ? `📦 طلب جديد مسند إليك! #${order.id}`
            : `📦 New Order Assigned! #${order.id}`;
          const body = language === 'ar'
            ? `العميل: ${order.customer?.name || ''} - المبلغ: ${order.total_amount || 0} ج.م`
            : `Customer: ${order.customer?.name || ''} - Total: ${order.total_amount || 0} EGP`;

          new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
        }
      } catch (err) {
        console.debug('Browser notification error:', err);
      }
    };

    // 1. Initial fetch to seed currently assigned orders so existing ones don't trigger alerts
    listOrders()
      .then((existingOrders) => {
        if (!isMounted) return;
        if (Array.isArray(existingOrders)) {
          existingOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
        }
        initializedRef.current = true;
      })
      .catch(() => {
        initializedRef.current = true;
      });

    // 2. Connect to Server-Sent Events stream (Skipped when explicitly in Demo Mode)
    const IS_DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';
    if (!IS_DEMO) {
      try {
        const sseUrl = `${baseURL}/notifications/stream?token=${encodeURIComponent(token)}`;
        eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'order_assigned' && data.order) {
              triggerOrderNotification(data.order);
            }
          } catch (e) {
            // ignore keep-alives or non-json
          }
        };

        eventSource.onerror = () => {
          // SSE reconnects automatically
        };
      } catch (e) {
        console.debug('Failed to initialize SSE:', e);
      }
    }

    // 3. Smart polling fallback every 12 seconds
    const pollTimer = setInterval(async () => {
      if (!isMounted) return;
      try {
        const freshOrders = await listOrders();
        if (!isMounted || !Array.isArray(freshOrders)) return;

        if (!initializedRef.current) {
          freshOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
          initializedRef.current = true;
          return;
        }

        freshOrders.forEach((order) => {
          if (!knownOrderIdsRef.current.has(order.id)) {
            triggerOrderNotification(order);
          }
        });
      } catch (e) {}
    }, 12000);

    // CRITICAL: Cleanup on logout or unmount
    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollTimer);
    };
  }, [isAuthenticated, isDriver, user?.id, token, language]);

  const dismissNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const viewOrder = useCallback((orderId) => {
    setActiveNotification(null);
    navigate(`/orders/${orderId}`);
  }, [navigate]);

  return (
    <CourierNotificationContext.Provider
      value={{
        activeNotification,
        dismissNotification,
        viewOrder,
        playCourierChime,
      }}
    >
      {children}

      {/* Real-time In-App Notification Banner */}
      {activeNotification && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-[#061e38] via-[#092b52] to-[#041629] border-2 border-cyan-400 rounded-2xl shadow-2xl p-4 text-white relative overflow-hidden backdrop-blur-xl">
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 animate-pulse" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/40 shadow-inner relative">
                  <Bike className="w-5 h-5 text-cyan-300 animate-bounce" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{language === 'ar' ? 'طلب جديد مسند إليك!' : 'New Order Assigned!'}</span>
                    <span className="text-cyan-400 font-extrabold">#{activeNotification.id}</span>
                  </h4>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">
                    {activeNotification.customer?.name}
                  </p>
                  {activeNotification.customer?.address && (
                    <p className="text-[11px] text-slate-400 truncate max-w-[210px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{activeNotification.customer.address}</span>
                    </p>
                  )}
                  <p className="text-xs font-black text-emerald-300 mt-1.5">
                    {formatCurrency(parseFloat(activeNotification.total_amount) || 0, language)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={dismissNotification}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-cyan-950/60 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-3.5 pt-3 border-t border-cyan-900/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={dismissNotification}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Dismiss'}
              </button>
              <button
                type="button"
                onClick={() => viewOrder(activeNotification.id)}
                className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 rounded-xl hover:from-cyan-300 hover:to-teal-300 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'عرض الطلب الآن' : 'View Order'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </CourierNotificationContext.Provider>
  );
}

export function useCourierNotification() {
  return useContext(CourierNotificationContext);
}
