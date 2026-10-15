import { apiClient } from './client';
import {
  mockListOrders,
  mockGetOrder,
  mockCreateOrder,
  mockAssignOrder,
  mockUpdateOrderStatus,
  mockUpdateOrder,
  mockDeleteOrder,
} from './mockStorage';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('deliveryhub_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function listOrders() {
  if (IS_DEMO) {
    const user = getCurrentUser();
    return mockListOrders(user?.id, user?.role === 'driver');
  }
  const res = await apiClient.get('/orders');
  return res.data.orders;
}

export async function getOrder(id) {
  if (IS_DEMO) {
    return mockGetOrder(id);
  }
  const res = await apiClient.get(`/orders/${id}`);
  return res.data.order;
}

export async function createOrder(orderData) {
  if (IS_DEMO) {
    return mockCreateOrder(orderData);
  }
  const res = await apiClient.post('/orders', orderData);
  return res.data.order;
}

export async function assignOrder(orderId, driverId) {
  if (IS_DEMO) {
    return mockAssignOrder(orderId, driverId);
  }
  const res = await apiClient.patch(`/orders/${orderId}/assign`, {
    driver_id: Number(driverId),
  });
  return res.data.order;
}

export async function updateOrderStatus(orderId, status) {
  if (IS_DEMO) {
    return mockUpdateOrderStatus(orderId, status);
  }
  const res = await apiClient.patch(`/orders/${orderId}/status`, {
    status,
  });
  return res.data.order;
}

export async function updateOrder(orderId, orderData) {
  if (IS_DEMO) {
    return mockUpdateOrder(orderId, orderData);
  }
  const res = await apiClient.put(`/orders/${orderId}`, orderData);
  return res.data.order;
}

export async function deleteOrder(orderId) {
  if (IS_DEMO) {
    return mockDeleteOrder(orderId);
  }
  const res = await apiClient.delete(`/orders/${orderId}`);
  return res.data;
}
