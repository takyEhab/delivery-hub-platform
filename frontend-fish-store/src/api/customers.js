import { apiClient } from './client';
import {
  mockListCustomers,
  mockSearchCustomers,
  mockCreateCustomer,
  mockUpdateCustomer,
  mockDeleteCustomer,
} from './mockStorage';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';

export async function listCustomers() {
  if (IS_DEMO) {
    return mockListCustomers();
  }
  const res = await apiClient.get('/customers');
  return res.data.customers;
}

export async function searchCustomers(query) {
  if (IS_DEMO) {
    return mockSearchCustomers(query);
  }
  const res = await apiClient.get('/customers/search', {
    params: { q: query },
  });
  return res.data.customers;
}

export async function createCustomer(customerData) {
  if (IS_DEMO) {
    return mockCreateCustomer(customerData);
  }
  const res = await apiClient.post('/customers', customerData);
  return res.data.customer;
}

export async function updateCustomer(id, customerData) {
  if (IS_DEMO) {
    return mockUpdateCustomer(id, customerData);
  }
  const res = await apiClient.patch(`/customers/${id}`, customerData);
  return res.data.customer;
}

export async function deleteCustomer(id) {
  if (IS_DEMO) {
    return mockDeleteCustomer(id);
  }
  await apiClient.delete(`/customers/${id}`);
}
