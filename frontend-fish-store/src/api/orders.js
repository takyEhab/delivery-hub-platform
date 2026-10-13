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
  if (paymentStatus) payload.payment_status = paymentStatus;
  if (paymentNotes) payload.payment_notes = paymentNotes;
  const res = await apiClient.patch(`/orders/${orderId}/status`, payload);
  return res.data.order;
}

export async function updatePaymentStatus(orderId, paymentStatus, paymentNotes = null) {
  const res = await apiClient.patch(`/orders/${orderId}/payment`, {
    payment_status: paymentStatus,
    payment_notes: paymentNotes,
  });
  return res.data.order;
}

export async function updateOrder(orderId, orderData) {
  const res = await apiClient.put(`/orders/${orderId}`, orderData);
  return res.data.order;
}

