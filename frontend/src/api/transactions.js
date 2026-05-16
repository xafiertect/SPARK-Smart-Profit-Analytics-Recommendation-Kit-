import { api } from './client';

export async function listTransactions(dateFrom, dateTo) {
  const params = new URLSearchParams();
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);
  const qs = params.toString();
  return api.get(`/api/v1/transactions/${qs ? `?${qs}` : ''}`);
}

export async function createTransaction(data) {
  return api.post('/api/v1/transactions/', data);
}

export async function getTransaction(transactionId) {
  return api.get(`/api/v1/transactions/${transactionId}`);
}
