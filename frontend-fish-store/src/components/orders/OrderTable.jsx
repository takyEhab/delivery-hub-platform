import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  formatStatus,
  getStatusBadgeVariant,
  formatDate,
} from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { OrderCard } from './OrderCard';
import { Fish, Truck, Phone, ChevronRight, User, Edit3 } from 'lucide-react';

export function OrderTable({ orders, onAssignClick, onStatusUpdated, isOwner, isDriver }) {
  const { t, language } = useLanguage();

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center mx-auto text-cyan-400 mb-3 shadow-inner">
          <Fish className="w-7 h-7 stroke-[2]" />
        </div>
        <h3 className="text-base font-bold text-white">{t('no_orders_found')}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          {isDriver
            ? (language === 'ar' ? 'لا توجد طلبات توصيل مسندة إليك حالياً.' : 'You currently have no delivery orders assigned to you.')
            : (language === 'ar' ? 'لا توجد طلبات مسجلة تطابق شروط الفلترة الحالية.' : 'No orders have been recorded or match your filter criteria.')}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-[#05172b]/90 rounded-2xl border border-cyan-900/40 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#030f1c] border-b border-cyan-950/80 text-cyan-400/90 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-5">{t('order_number')}</th>
                <th className="py-4 px-4">{t('customer')}</th>
                <th className="py-4 px-4">{t('address')}</th>
                <th className="py-4 px-4">{t('status')}</th>
                <th className="py-4 px-4">{t('driver_assigned')}</th>
                <th className="py-4 px-4">{t('time')}</th>
                <th className="py-4 px-5 text-left rtl:text-left ltr:text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/60 text-slate-200">
              {orders.map((order) => {
                const parsedItems = Array.isArray(order.items)
                  ? order.items
                  : typeof order.items === 'string'
                  ? [{ name: order.items, quantity: 1 }]
                  : [];

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-cyan-950/30 transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-black text-white group-hover:text-cyan-400 transition-colors text-sm"
                      >
                        #{order.id}
                      </Link>
                      <p className="text-[11px] text-cyan-400/80 font-medium">
                        {parsedItems.length} {language === 'ar' ? 'أصناف أسماك' : 'item(s)'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">
                        {order.customer?.name}
                      </p>
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="text-[11px] text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1 mt-0.5"
                          dir="ltr"
                        >
                          <Phone className="w-3 h-3 text-cyan-400" />
                          {order.customer.phone}
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-300 truncate">
                        {order.customer?.address || (language === 'ar' ? 'استلام من المحل' : 'Store pickup')}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        size="sm"
                        dot
                      >
                        {formatStatus(order.status, language)}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {order.driver ? (
                        <div className="flex items-center gap-1.5 text-xs text-white">
                          <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-semibold">{order.driver.name}</span>
                        </div>
                      ) : isOwner ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAssignClick(order)}
                          className="text-xs text-amber-300 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/30 py-1 px-2.5 h-auto"
                        >
                          {t('assign_driver')}
                        </Button>
                      ) : (
                        <span className="text-slate-500 text-xs italic">{t('unassigned')}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(order.created_at, language)}
                    </td>

                    <td className="py-3.5 px-5 text-left rtl:text-left ltr:text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isOwner && (
                          <Link to={`/orders/${order.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Edit3}
                              className="text-xs py-1 px-2.5 border-cyan-900/60 text-cyan-300 hover:text-white hover:bg-cyan-950/60 hover:border-cyan-700"
                            >
                              {t('edit_order')}
                            </Button>
                          </Link>
                        )}
                        <Link to={`/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={ChevronRight}
                            iconPosition="right"
                            className="text-xs py-1 px-3 border-cyan-800/60 text-cyan-300 hover:bg-cyan-950/40"
                          >
                            {t('view_details')}
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet Cards Grid */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isOwner={isOwner}
            isDriver={isDriver}
            onStatusUpdated={onStatusUpdated}
            onAssignClick={onAssignClick}
          />
        ))}
      </div>
    </>
  );
}
