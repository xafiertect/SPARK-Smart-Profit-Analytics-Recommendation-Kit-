import { api } from './client';

export async function getSummary() {
  return api.get('/api/v1/dashboard/summary');
}

export async function getChart(period = '7d') {
  return api.get(`/api/v1/dashboard/chart?period=${period}`);
}
