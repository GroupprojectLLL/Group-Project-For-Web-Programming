const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  const payload = response.status === 204
    ? {}
    : await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.error || `API returned ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}
