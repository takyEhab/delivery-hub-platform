import { apiClient } from './client';

export async function login({ phone, password }) {
  const res = await apiClient.post('/auth/login', { phone, password });
  return res.data; // { token, user: { id, name, phone, email, role } }
}

export async function registerDriver(data) {
  const res = await apiClient.post('/auth/register', data);
  return res.data; // { user }
}
