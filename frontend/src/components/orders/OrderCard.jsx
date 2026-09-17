import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  formatStatus,
  getStatusBadgeVariant,
  formatDate,
  formatShortDate,
} from '../../utils/formatters';
import {
  Phone,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  ChevronRight,
  Package,
  User,
} from 'lucide-react';
import { updateOrderStatus } from '../../api/orders';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../hooks/useToast';

export function OrderCard({
  order,
  isDriver = false,
  isOwner = false,
  onStatusUpdated,
  onAssignClick,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error: toastError } = useToast();

  const handleAdvanceStatus = async (nextStatus) => {
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      success(
        `Order #${order.id} status updated to ${formatStatus(nextStatus)}!`,
        'Status Updated'
      );
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

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between gap-4">
      {/* Top row: Order ID, status badge, created timestamp */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-base">
              Order #{order.id}
            </span>
            <Badge variant={getStatusBadgeVariant(order.status)} size="sm" dot>
              {formatStatus(order.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(order.created_at)}</span>
          </div>
        </div>

        <Link
          to={`/orders/${order.id}`}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 p-1 rounded hover:bg-emerald-50 transition-colors"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Customer and address section */}
      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-900">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{order.customer?.name}</span>
          </div>
          {order.customer?.phone && (
            <a
              href={`tel:${order.customer.phone}`}
              className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full font-medium transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
          )}
        </div>

        <div className="flex items-start gap-1.5 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{order.customer?.address}</span>
        </div>

        {order.customer?.notes && (
          <div className="text-[11px] text-slate-500 italic pl-5">
            Note: "{order.customer.notes}"
          </div>
        )}
      </div>

      {/* Items preview */}
      <div className="text-xs space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Package className="w-3 h-3" />
          <span>Items ({parsedItems.length})</span>
        </div>
        <div className="text-slate-700 space-y-0.5 line-clamp-2">
          {parsedItems.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="truncate">
                {it.quantity ? `${it.quantity}x ` : ''}
                {it.name || it.description || 'Item'}
              </span>
              {it.price && (
                <span className="text-slate-400 font-mono text-[11px]">
                  ${(it.price * (it.quantity || 1)).toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Driver info & Action bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Driver attribution if owner */}
        {isOwner && (
          <div className="text-xs">
            {order.driver ? (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>
                  Driver: <strong>{order.driver.name}</strong>
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAssignClick && onAssignClick(order)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1 hover:underline"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Assign Driver</span>
              </button>
            )}
          </div>
        )}

        {/* Driver action button */}
        {isDriver && (
          <div className="w-full">
            {order.status === 'preparing' && (
              <Button
                variant="primary"
                size="md"
                icon={Truck}
                isLoading={isUpdating}
                onClick={() => handleAdvanceStatus('out_for_delivery')}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
              >
                Start Delivery (Out for Delivery)
              </Button>
            )}

            {order.status === 'out_for_delivery' && (
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle2}
                isLoading={isUpdating}
                onClick={() => handleAdvanceStatus('delivered')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                Mark as Delivered
              </Button>
            )}

            {order.status === 'delivered' && (
              <div className="w-full py-2 bg-emerald-50 rounded-lg text-emerald-800 font-semibold text-xs text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Delivery Completed</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
