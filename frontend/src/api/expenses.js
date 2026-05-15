import { api } from './client';

export async function listExpenses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  if (filters.category) params.set('category', filters.category);
  if (filters.source) params.set('source', filters.source);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return api.get(`/api/v1/expenses/${qs ? `?${qs}` : ''}`);
}

export async function createExpense(data) {
  return api.post('/api/v1/expenses/', data);
}

export async function updateExpense(expenseId, data) {
  return api.put(`/api/v1/expenses/${expenseId}`, data);
}

export async function confirmExpense(expenseId) {
  return api.put(`/api/v1/expenses/${expenseId}/confirm`, {});
}

export async function deleteExpense(expenseId) {
  return api.delete(`/api/v1/expenses/${expenseId}`);
}
