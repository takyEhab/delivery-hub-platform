import { apiClient } from './client';

export async function listOrders() {
  const res = await apiClient.get('/orders');
  return res.data.orders;
}

export async function getOrder(id) {
  const res = await apiClient.get(`/orders/${id}`);
  return res.data.order;
}

export async function createOrder(orderData) {
  const res = await apiClient.post('/orders', orderData);
  return res.data.order;
}

export async function assignOrder(orderId, driverId) {
  const res = await apiClient.patch(`/orders/${orderId}/assign`, {
    driver_id: Number(driverId),
  });
  return res.data.order;
}

export async function updateOrderStatus(orderId, status, paymentStatus = null, paymentNotes = null) {
  const payload = { status };

  if (paymentStatus) {
    if (typeof paymentStatus === 'object') {
      const ps = paymentStatus.paymentStatus || paymentStatus.payment_status;
      if (typeof ps === 'string' && ps.trim()) {
        payload.payment_status = ps.trim();
      }
      const pn = paymentStatus.paymentNotes || paymentStatus.payment_notes;
      if (typeof pn === 'string' && pn.trim()) {
        payload.payment_notes = pn.trim();
      }
    } else if (typeof paymentStatus === 'string' && paymentStatus.trim()) {
      payload.payment_status = paymentStatus.trim();
      if (typeof paymentNotes === 'string' && paymentNotes.trim()) {
        payload.payment_notes = paymentNotes.trim();
      }
    }
  }

  const res = await apiClient.patch(`/orders/${orderId}/status`, payload);
  return res.data.order;
}

export async function updatePaymentStatus(orderId, paymentStatus, paymentNotes = null) {
  let finalStatus = null;
  let finalNotes = null;

  if (paymentStatus && typeof paymentStatus === 'object') {
    finalStatus = paymentStatus.paymentStatus || paymentStatus.payment_status;
    finalNotes = paymentStatus.paymentNotes || paymentStatus.payment_notes || null;
  } else if (typeof paymentStatus === 'string') {
    finalStatus = paymentStatus;
    finalNotes = paymentNotes;
  }

  const payload = {
    payment_status: typeof finalStatus === 'string' ? finalStatus.trim() : finalStatus,
  };
  if (finalNotes && typeof finalNotes === 'string') {
    payload.payment_notes = finalNotes.trim();
  }

  const res = await apiClient.patch(`/orders/${orderId}/payment`, payload);
  return res.data.order;
}

export async function updateOrder(orderId, orderData) {
  const res = await apiClient.put(`/orders/${orderId}`, orderData);
  return res.data.order;
}

