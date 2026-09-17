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
