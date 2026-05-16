import { api } from './client';

export async function listProducts() {
  return api.get('/api/v1/products/');
}

export async function createProduct(data) {
  return api.post('/api/v1/products/', data);
}

export async function updateProduct(productId, data) {
  return api.put(`/api/v1/products/${productId}`, data);
}

export async function deleteProduct(productId) {
  return api.delete(`/api/v1/products/${productId}`);
}
