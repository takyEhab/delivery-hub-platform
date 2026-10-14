/**
 * Formatting helpers for Prince of the Seas — أمير البحار
 */

export function formatStatus(status, lang = 'ar') {
  if (lang === 'ar') {
    switch (status) {
      case 'preparing':
        return 'قيد التجهيز والطهي';
      case 'out_for_delivery':
        return 'في طريق التوصيل';
      case 'delivered':
        return 'تم التسليم بنجاح';
      default:
        return status || 'غير محدد';
    }
  }

  switch (status) {
    case 'preparing':
      return 'Preparing & Cooking';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    default:
      return status ? status.replace(/_/g, ' ') : 'Unknown';
  }
}

export function getStatusBadgeVariant(status) {
  switch (status) {
    case 'preparing':
      return 'warning'; // Amber / Orange
    case 'out_for_delivery':
      return 'info';    // Ocean / Cyan
    case 'delivered':
      return 'success'; // Emerald / Marine
    default:
      return 'neutral';
  }
}

export function formatPaymentStatus(status, lang = 'ar') {
  if (lang === 'ar') {
    switch (status) {
      case 'paid':
        return 'تم الدفع (خالص)';
      case 'postpaid':
        return 'آجل (دين / مؤجل)';
      case 'unpaid':
      default:
        return 'غير مدفوع (تحصيل)';
    }
  }

  switch (status) {
    case 'paid':
      return 'Paid';
    case 'postpaid':
      return 'On Credit (Postpaid)';
    case 'unpaid':
    default:
      return 'Unpaid (To Collect)';
  }
}

export function getPaymentBadgeVariant(status) {
  switch (status) {
    case 'paid':
      return 'success';  // Green / Emerald
    case 'postpaid':
      return 'danger';   // Rose / Red (On credit / debt)
    case 'unpaid':
    default:
      return 'warning';  // Amber
  }
}

export function formatDate(dateString, lang = 'ar') {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatShortDate(dateString, lang = 'ar') {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatCurrency(amount, lang = 'ar') {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return lang === 'ar' ? '0 ج.م' : '0.00 EGP';
  }
  const num = Number(amount);
  if (lang === 'ar') {
    return `${num.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
  }
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
}

export function formatPhone(phone) {
  if (!phone) return '';
  return phone.trim();
}

/**
 * Detect if an order or any of its items contains raw / fresh uncooked fish.
 */
export function hasRawFish(order) {
  if (!order) return false;
  if (order.is_raw_fish || order.isRawFish) return true;

  const items = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? [{ name: order.items }]
    : [];

  return items.some((item) => isRawFishItem(item));
}

/**
 * Detect if a single order item contains raw / fresh uncooked fish.
 */
export function isRawFishItem(item) {
  if (!item) return false;
  if (item.is_raw_fish || item.isRawFish) return true;
  const text = `${item.name || ''} ${item.description || ''} ${item.notes || ''}`.toLowerCase();
  return (
    text.includes('نيء') ||
    text.includes('نيئة') ||
    text.includes('طازجة / نيئة') ||
    text.includes('طازج / نيء') ||
    text.includes('raw fish') ||
    text.includes('raw fresh') ||
    text.includes('[raw')
  );
}
