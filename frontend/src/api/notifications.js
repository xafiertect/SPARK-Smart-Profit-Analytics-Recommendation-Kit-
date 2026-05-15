import { api } from './client';

export async function getNotifications(status) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const qs = params.toString();
  return api.get(`/api/v1/notifications/${qs ? `?${qs}` : ''}`);
}

export async function getUnreadCount() {
  return api.get('/api/v1/notifications/unread-count');
}

export async function updateNotificationStatus(notificationId, status) {
  return api.put(`/api/v1/notifications/${notificationId}/status`, { status });
}

export async function checkNotifications() {
  return api.post('/api/v1/notifications/check', {});
}
