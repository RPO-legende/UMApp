/**
 * API client utility that automatically adds JWT token to requests
 */

const API_BASE_URL = '/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Fetch wrapper that automatically adds authentication token
 */
export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const token = localStorage.getItem('authToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * GET request with authentication
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * POST request with authentication
 */
export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
}

/**
 * PUT request with authentication
 */
export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
}

/**
 * DELETE request with authentication
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
}

/**
 * Upload file with authentication
 */
export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('authToken');

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Upload failed');
  }
  
  return response.json();
}
