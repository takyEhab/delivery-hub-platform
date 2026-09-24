import { apiClient } from './client';

export async function listCustomers() {
  const res = await apiClient.get('/customers');
  return res.data.customers;
}

export async function searchCustomers(query) {
  const res = await apiClient.get('/customers/search', {
    params: { q: query },
  });
  return res.data.customers;
}

export async function createCustomer(customerData) {
  const res = await apiClient.post('/customers', customerData);
  return res.data.customer;
}

export async function updateCustomer(id, customerData) {
  const res = await apiClient.patch(`/customers/${id}`, customerData);
  return res.data.customer;
}
