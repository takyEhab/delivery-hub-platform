/**
 * Formatting helpers for DeliveryHub
 */

export function formatStatus(status) {
  switch (status) {
    case 'preparing':
      return 'Preparing';
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
      return 'info';    // Blue
    case 'delivered':
      return 'success'; // Emerald / Green
    default:
      return 'neutral';
  }
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatShortDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
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
