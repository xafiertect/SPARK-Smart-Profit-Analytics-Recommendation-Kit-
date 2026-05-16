import { api } from './client';

export async function registerUser(email, password, businessName) {
  return api.post('/api/v1/auth/register', {
    email,
    password,
    business_name: businessName,
  });
}

export async function loginUser(email, password) {
  return api.post('/api/v1/auth/login', { email, password });
}

export async function refreshToken(refreshToken) {
  return api.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
}

export async function getProfile() {
  return api.get('/api/v1/auth/profile');
}
