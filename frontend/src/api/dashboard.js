import { api } from './client';

export async function getSummary() {
  return api.get('/api/v1/dashboard/summary');
}
