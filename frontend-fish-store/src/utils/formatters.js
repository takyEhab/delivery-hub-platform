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
