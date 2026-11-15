import React, { useState } from 'react';
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
  isRawFishItem,
} from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import {
  Phone,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  ChevronRight,
  User,
  Edit3,
  Navigation,
  Banknote,
} from 'lucide-react';
import { buildGoogleMapsUrl } from '../../utils/location';
import { updateOrderStatus, updatePaymentStatus } from '../../api/orders';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';

export function OrderCard({
  order,
  isDriver = false,
  isOwner = false,
  onStatusUpdated,
  onAssignClick,
  onEditCustomer,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error: toastError } = useToast();
  const { t, language } = useLanguage();

  const handleAdvanceStatus = async (nextStatus, paymentStatus = null) => {
    setIsUpdating(true);
    try {
      const validPaymentStatus = typeof paymentStatus === 'string' ? paymentStatus : null;
      const updated = await updateOrderStatus(order.id, nextStatus, validPaymentStatus);
      const title = language === 'ar' ? 'تم تحديث حالة الطلب' : 'Status Updated';
      const msg = language === 'ar'
        ? `تم تحديث حالة طلب #${order.id} إلى: ${formatStatus(nextStatus, 'ar')}`
        : `Order #${order.id} status updated to ${formatStatus(nextStatus, 'en')}!`;

      success(msg, title);
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickPaymentUpdate = async (newPaymentStatus) => {
    setIsUpdating(true);
    try {
      const updated = await updatePaymentStatus(order.id, newPaymentStatus);
      const title = language === 'ar' ? 'تم تحديث الدفع والتحصيل' : 'Payment Updated';
      const msg = language === 'ar'
        ? `تم تحديث حالة دفع طلب #${order.id} إلى: ${formatPaymentStatus(newPaymentStatus, 'ar')}`
        : `Order #${order.id} payment updated to ${formatPaymentStatus(newPaymentStatus, 'en')}!`;

      success(msg, title);
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const parsedItems = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? [{ name: order.items, quantity: 1 }]
    : [];

  const totalAmountVal = parseFloat(order.total_amount) || 0;
  const orderHasRaw = hasRawFish(order);

  return (
    <div className={`bg-[#0F1622] rounded-xl border ${
      orderHasRaw
        ? 'border-rose-900/40'
        : 'border-slate-800/80'
    } shadow-card hover:border-slate-700 transition-colors p-4 sm:p-5 flex flex-col justify-between gap-4`}>
      {/* Top row: Order ID, Total Amount, Badges */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white text-base font-mono">
              #{order.id}
            </span>
            <span className="text-sm font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              {formatCurrency(totalAmountVal, language)}
            </span>
            <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
              {formatStatus(order.status, language)}
            </Badge>
            <Badge variant={getPaymentBadgeVariant(order.payment_status)} size="sm">
              {formatPaymentStatus(order.payment_status, language)}
            </Badge>
            {orderHasRaw && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/50">
                <span>🐟</span>
                <span>{language === 'ar' ? 'سمك نيء' : 'Raw Fish'}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDate(order.created_at, language)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isOwner && (
            <Link
              to={`/orders/${order.id}/edit`}
              className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              title={t('edit_order')}
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('edit_order')}</span>
            </Link>
          )}
          <Link
            to={`/orders/${order.id}`}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 p-1 rounded hover:bg-slate-800/50 transition-colors"
          >
            <span>{t('view_details')}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* Customer and address section */}
      <div className="bg-[#0B1019] rounded-lg p-3 border border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-white min-w-0">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{order.customer?.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onEditCustomer && order.customer && (
              <button
                type="button"
                onClick={() => onEditCustomer(order.customer)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                title={language === 'ar' ? 'تعديل موقع وملاحظات العميل' : 'Edit customer location & notes'}
              >
                <Edit3 className="w-3 h-3 text-slate-400" />
                <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
              </button>
            )}
            {order.customer?.phone && (
              <a
                href={`tel:${order.customer.phone}`}
                className="inline-flex items-center gap-1 text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded font-mono transition-colors border border-slate-700"
                dir="ltr"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{order.customer.phone}</span>
              </a>
            )}
          </div>
        </div>

        {(() => {
          const mapsUrl = buildGoogleMapsUrl(order.customer?.location_url, order.customer?.address);
          if (!order.customer?.address && !mapsUrl) return null;
          return (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-slate-300">
              <div className="flex items-start gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="truncate text-slate-400">{order.customer?.address || (language === 'ar' ? 'موقع محدد على الخريطة' : 'Pinned Location')}</span>
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 shrink-0 transition-colors"
                  title={language === 'ar' ? 'فتح موقع العميل في خرائط جوجل' : 'Open in Google Maps'}
                >
                  <Navigation className="w-3 h-3 text-blue-400" />
                  <span>{language === 'ar' ? 'الخريطة' : 'Maps'}</span>
                </a>
              )}
            </div>
          );
        })()}
      </div>

      {/* Seafood Items list */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>{t('order_items')} ({parsedItems.length}):</span>
          {orderHasRaw && (
            <span className="text-[11px] font-medium text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
              {language === 'ar' ? 'سمك نيء' : 'Raw Fish'}
            </span>
          )}
        </div>
        <div className="bg-[#0B1019] p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-xs max-h-28 overflow-y-auto">
          {parsedItems.map((item, idx) => {
            const itemIsRaw = isRawFishItem(item);
            return (
              <div key={idx} className={`flex justify-between items-center ${itemIsRaw ? 'text-rose-200 font-medium' : 'text-slate-300'}`}>
                <span className="truncate max-w-[210px] flex items-center gap-1.5">
                  <span>• {item.name || item.description}</span>
                  {itemIsRaw && (
                    <span className="shrink-0 px-1 py-0.2 rounded bg-rose-950 text-rose-300 text-[10px] font-semibold border border-rose-800/50">
                      {language === 'ar' ? 'نيء' : 'Raw'}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  ×{item.quantity}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver info & action buttons */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {order.driver ? (
                <span className="font-medium text-white">{order.driver.name}</span>
              ) : (
                <span className="text-amber-400 italic text-[11px]">{t('unassigned')}</span>
              )}
            </span>
          </div>

          {isOwner && !order.driver && order.status !== 'delivered' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignClick(order)}
              className="text-xs py-0.5 px-2.5"
            >
              {t('assign_driver')}
            </Button>
          )}
        </div>

        {/* Fast Payment Status Banner */}
        {order.payment_status === 'unpaid' && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-950/30 border border-amber-800/50">
            <div className="flex items-center gap-1.5 text-xs text-amber-300">
              <Banknote className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{language === 'ar' ? 'تحصيل كاش:' : 'Cash due:'}</span>
              <span className="font-bold text-amber-200">{formatCurrency(totalAmountVal, language)}</span>
            </div>
            {(isOwner || isDriver) && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleQuickPaymentUpdate('paid')}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded transition-colors flex items-center gap-1 shrink-0 shadow-button"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{t('mark_as_paid')}</span>
              </button>
            )}
          </div>
        )}

        {order.payment_status === 'postpaid' && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-purple-950/30 border border-purple-800/50">
            <div className="flex items-center gap-1.5 text-xs text-purple-300">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{language === 'ar' ? 'طلب آجل (على الحساب):' : 'On Credit:'}</span>
              <span className="font-bold text-purple-200">{formatCurrency(totalAmountVal, language)}</span>
            </div>
            {(isOwner || isDriver) && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleQuickPaymentUpdate('paid')}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded transition-colors flex items-center gap-1 shrink-0 shadow-button"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{t('mark_as_paid')}</span>
              </button>
            )}
          </div>
        )}

        {order.payment_status === 'paid' && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/50">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{language === 'ar' ? 'تم الدفع بالكامل' : 'Paid in Full'}</span>
              <span className="text-[11px] text-emerald-400 font-mono">({formatCurrency(totalAmountVal, language)})</span>
            </div>
            {isOwner && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleQuickPaymentUpdate('unpaid')}
                className="text-[11px] text-slate-400 hover:text-amber-300 underline"
              >
                {t('mark_as_unpaid')}
              </button>
            )}
          </div>
        )}

        {/* Progression buttons for Driver & Owner */}
        {(isDriver || isOwner) && (
          <div className="flex items-center gap-2 mt-1">
            {order.status === 'preparing' && (
              <Button
                variant="primary"
                size="sm"
                icon={Truck}
                isLoading={isUpdating}
                onClick={() => handleAdvanceStatus('out_for_delivery')}
                className="w-full text-xs"
              >
                {language === 'ar' ? 'استلام وبدء التوصيل' : 'Start Delivery'}
              </Button>
            )}

            {order.status === 'out_for_delivery' && (
              order.payment_status !== 'paid' ? (
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    isLoading={isUpdating}
                    onClick={() => handleAdvanceStatus('delivered', 'paid')}
                    className="w-full sm:flex-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    {language === 'ar' ? 'تسليم + استلام كاش' : 'Delivered & Paid'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Clock}
                    isLoading={isUpdating}
                    onClick={() => handleAdvanceStatus('delivered', 'postpaid')}
                    className="w-full sm:flex-1 text-xs text-purple-300 hover:text-white"
                  >
                    {language === 'ar' ? 'تسليم بدون دفع (آجل)' : 'Delivered (Credit)'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  isLoading={isUpdating}
                  onClick={() => handleAdvanceStatus('delivered')}
                  className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {language === 'ar' ? 'تأكيد تسليم الطلب' : 'Mark as Delivered'}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
