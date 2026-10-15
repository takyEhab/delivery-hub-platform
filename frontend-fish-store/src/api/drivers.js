import { apiClient } from './client';
import {
  mockListDrivers,
  mockCreateDriver,
  mockUpdateDriver,
  mockDeleteDriver,
} from './mockStorage';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';

export async function listDrivers() {
  if (IS_DEMO) {
    return mockListDrivers();
  }
  const res = await apiClient.get('/drivers');
  return res.data.drivers;
}

export async function createDriver(driverData) {
  if (IS_DEMO) {
    return mockCreateDriver(driverData);
  }
  const res = await apiClient.post('/drivers', driverData);
  return res.data.driver;
}

export async function updateDriver(id, driverData) {
  if (IS_DEMO) {
    return mockUpdateDriver(id, driverData);
  }
  const res = await apiClient.patch(`/drivers/${id}`, driverData);
  return res.data.driver;
}

export async function deleteDriver(id) {
  if (IS_DEMO) {
    return mockDeleteDriver(id);
  }
  await apiClient.delete(`/drivers/${id}`);
}
