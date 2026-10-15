import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listOrders } from '../api/orders';
import { baseURL } from '../api/client';
import { Bike, Bell, X, ExternalLink, MapPin } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const CourierNotificationContext = createContext(null);

function playCourierChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.16);
    gain2.gain.setValueAtTime(0.3, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.65);
  } catch (e) {
    console.debug('Notification audio skipped:', e);
  }
}

export function CourierNotificationProvider({ children }) {
  const { isAuthenticated, isDriver, user, token } = useAuth();
  const navigate = useNavigate();

  const [activeNotification, setActiveNotification] = useState(null);
  const knownOrderIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && isDriver && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [isAuthenticated, isDriver]);

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

    const triggerOrderNotification = (order) => {
      if (!order || !order.id) return;
      if (knownOrderIdsRef.current.has(order.id)) return;
      knownOrderIdsRef.current.add(order.id);

      playCourierChime();
      setActiveNotification(order);

      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`📦 New Order Assigned! #${order.id}`, {
            body: `Customer: ${order.customer?.name || ''} - Total: ${order.total_amount || 0} EGP`,
            icon: '/favicon.ico',
          });
        }
      } catch (err) {
        console.debug('Browser notification error:', err);
      }
    };

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

    // Skip live SSE in standalone Demo Mode
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
          } catch (e) {}
        };
      } catch (e) {
        console.debug('Failed to initialize SSE:', e);
      }
    }

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

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollTimer);
    };
  }, [isAuthenticated, isDriver, user?.id, token]);

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

      {activeNotification && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 text-white relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 relative">
                  <Bike className="w-5 h-5 text-emerald-400" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>New Order Assigned!</span>
                    <span className="text-emerald-400 font-extrabold">#{activeNotification.id}</span>
                  </h4>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {activeNotification.customer?.name}
                  </p>
                  {activeNotification.customer?.address && (
                    <p className="text-[11px] text-slate-400 truncate max-w-[210px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{activeNotification.customer.address}</span>
                    </p>
                  )}
                  <p className="text-xs font-black text-emerald-300 mt-1">
                    {formatCurrency(parseFloat(activeNotification.total_amount) || 0)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={dismissNotification}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={dismissNotification}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => viewOrder(activeNotification.id)}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <span>View Order</span>
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
