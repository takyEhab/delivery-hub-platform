import { apiClient } from './client';
import { mockLogin } from './mockStorage';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

export async function login({ phone, password }) {
  if (IS_DEMO) {
    return mockLogin({ phone, password });
  }
  const res = await apiClient.post('/auth/login', { phone, password });
  return res.data; // { token, user: { id, name, phone, email, role } }
}

export async function registerDriver(data) {
  if (IS_DEMO) {
    return { user: data };
  }
  const res = await apiClient.post('/auth/register', data);
  return res.data; // { user }
}
