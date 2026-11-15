import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  formatStatus,
  getStatusBadgeVariant,
  formatPaymentStatus,
  getPaymentBadgeVariant,
  formatDate,
  formatCurrency,
  hasRawFish,
} from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { OrderCard } from './OrderCard';
import { Anchor, Truck, Phone, ChevronRight, Edit3 } from 'lucide-react';

export function OrderTable({
  orders,
  onAssignClick,
  onStatusUpdated,
  onEditCustomer,
  isOwner,
  isDriver,
}) {
  const { t, language } = useLanguage();

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[#0F1622] rounded-xl border border-slate-800/80 shadow-card">
        <div className="w-12 h-12 rounded-xl bg-slate-850 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Anchor className="w-6 h-6 stroke-[2]" />
        </div>
        <h3 className="text-base font-semibold text-white">{t('no_orders_found')}</h3>
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
      <div className="hidden lg:block bg-[#0F1622] rounded-xl border border-slate-800/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#0B1019] border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-5">{t('order_number')}</th>
                <th className="py-3.5 px-4">{t('customer')}</th>
                <th className="py-3.5 px-4">{t('total_amount_to_pay')}</th>
                <th className="py-3.5 px-4">{t('status')}</th>
                <th className="py-3.5 px-4">{t('driver_assigned')}</th>
                <th className="py-3.5 px-4">{t('time')}</th>
                <th className="py-3.5 px-5 text-left rtl:text-left ltr:text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {orders.map((order) => {
                const parsedItems = Array.isArray(order.items)
                  ? order.items
                  : typeof order.items === 'string'
                  ? [{ name: order.items, quantity: 1 }]
                  : [];
                const totalAmountVal = parseFloat(order.total_amount) || 0;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm font-mono"
                        >
                          #{order.id}
                        </Link>
                        {hasRawFish(order) && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/50">
                            <span>🐟</span>
                            <span>{language === 'ar' ? 'نيء' : 'Raw'}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {parsedItems.length} {language === 'ar' ? 'أصناف' : 'item(s)'}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-white text-xs">
                          {order.customer?.name}
                        </p>
                        {onEditCustomer && order.customer && (
                          <button
                            type="button"
                            onClick={() => onEditCustomer(order.customer)}
                            className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                            title={language === 'ar' ? 'تعديل موقع وملاحظات العميل' : 'Edit customer location & notes'}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="text-[11px] text-slate-400 hover:text-blue-400 inline-flex items-center gap-1 mt-0.5 font-mono"
                          dir="ltr"
                        >
                          <Phone className="w-3 h-3 text-slate-500" />
                          {order.customer.phone}
                        </a>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-400 text-sm">
                        {formatCurrency(totalAmountVal, language)}
                      </span>
                      <div className="mt-1">
                        <Badge variant={getPaymentBadgeVariant(order.payment_status)} size="sm">
                          {formatPaymentStatus(order.payment_status, language)}
                        </Badge>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        size="sm"
                      >
                        {formatStatus(order.status, language)}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {order.driver ? (
                        <div className="flex items-center gap-1.5 text-xs text-white">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{order.driver.name}</span>
                        </div>
                      ) : isOwner ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAssignClick(order)}
                          className="text-xs text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/50 py-1 px-2.5 h-auto"
                        >
                          {t('assign_driver')}
                        </Button>
                      ) : (
                        <span className="text-slate-500 text-xs italic">{t('unassigned')}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap font-mono">
                      {formatDate(order.created_at, language)}
                    </td>

                    <td className="py-3 px-5 text-left rtl:text-left ltr:text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isOwner && (
                          <Link to={`/orders/${order.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Edit3}
                              className="text-xs py-1 px-2.5"
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
                            className="text-xs py-1 px-3"
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
            onEditCustomer={onEditCustomer}
          />
        ))}
      </div>
    </>
  );
}
