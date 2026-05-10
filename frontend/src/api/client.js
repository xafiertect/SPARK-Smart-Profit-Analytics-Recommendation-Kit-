const BASE_URL = 'http://127.0.0.1:8000';

/**
 * Get the stored access token.
 * Using a module-level ref so the API client can read it without importing Zustand.
 */
let _getToken = () => null;
export function setTokenGetter(fn) {
  _getToken = fn;
}

let _onUnauthorized = () => {};
export function setOnUnauthorized(fn) {
  _onUnauthorized = fn;
}

/**
 * Core fetch wrapper. Handles:
 * - JWT header injection
 * - Response envelope unwrapping ({data, meta} → data)
 * - Error envelope extraction ({error, code, message} → thrown)
 * - 401 → auto-logout callback
 */
export async function apiFetch(path, options = {}) {
  const token = _getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  // 401 Unauthorized → trigger logout
  if (response.status === 401) {
    _onUnauthorized();
    throw new ApiError('Sesi habis, silakan login lagi', 'SESSION_EXPIRED', 401);
  }

  const body = await response.json();

  if (!response.ok) {
    // Backend error envelope: {error: true, code, message}
    const message = body.message || body.detail || 'Terjadi kesalahan';
    const code = body.code || 'UNKNOWN_ERROR';
    throw new ApiError(message, code, response.status);
  }

  // Unwrap envelope: {data: ..., meta: ...} → data
  if (body.data !== undefined) {
    return body.data;
  }

  return body;
}

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// Convenience methods
export const api = {
  get: (path) => apiFetch(path),
  post: (path, data) =>
    apiFetch(path, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (path, data) =>
    apiFetch(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (path) =>
    apiFetch(path, { method: 'DELETE' }),
  upload: (path, file) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch(path, { method: 'POST', body: form });
  },
};
