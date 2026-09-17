import { apiClient } from './client';

export async function listDrivers() {
  const res = await apiClient.get('/drivers');
  return res.data.drivers;
}

export async function createDriver(driverData) {
  const res = await apiClient.post('/drivers', driverData);
  return res.data.driver;
}

export async function updateDriver(id, driverData) {
  const res = await apiClient.patch(`/drivers/${id}`, driverData);
  return res.data.driver;
}

export async function deleteDriver(id) {
  await apiClient.delete(`/drivers/${id}`);
}
