import { apiClient } from './client';
import {
  mockListOrders,
  mockGetOrder,
  mockCreateOrder,
  mockAssignOrder,
  mockUpdateOrderStatus,
  mockUpdatePaymentStatus,
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

export async function updateOrderStatus(orderId, status, paymentStatus = null, paymentNotes = null) {
  if (IS_DEMO) {
    let ps = null;
    let pn = null;
    if (paymentStatus) {
      if (typeof paymentStatus === 'object') {
        ps = paymentStatus.paymentStatus || paymentStatus.payment_status;
        pn = paymentStatus.paymentNotes || paymentStatus.payment_notes;
      } else if (typeof paymentStatus === 'string') {
        ps = paymentStatus;
        pn = paymentNotes;
      }
    }
    return mockUpdateOrderStatus(orderId, status, ps, pn);
  }

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

  if (IS_DEMO) {
    return mockUpdatePaymentStatus(orderId, finalStatus, finalNotes);
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
