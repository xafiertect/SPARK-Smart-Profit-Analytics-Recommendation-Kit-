import { api } from './client';

export async function scanReceipt(file) {
  return api.upload('/api/v1/ocr/scan', file);
}
