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

export async function updateOrderStatus(orderId, status) {
  const res = await apiClient.patch(`/orders/${orderId}/status`, {
    status,
  });
  return res.data.order;
}
