import { api } from './client';

export async function getInsights() {
  return api.get('/api/v1/agent/insights');
}

export async function generateInsights() {
  return api.post('/api/v1/agent/insights/generate', {});
}

export async function chatWithAI(message) {
  return api.post('/api/v1/agent/chat', { message });
}
