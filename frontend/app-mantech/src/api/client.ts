import { API_BASE_URL } from './config';
import { getToken } from '../auth/tokenStore';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Json = Record<string, any>;

// Handler global para sesión vencida/no autorizada (lo registra AuthProvider).
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body != null) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (e: any) {
    throw new ApiError(0, `No se pudo conectar con el servidor (${API_BASE_URL}). ${e?.message ?? ''}`.trim());
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {
      const text = await res.text().catch(() => '');
      if (text) message = text;
    }
    // 401 fuera del login = sesión vencida/inválida -> auto-logout.
    if (res.status === 401 && !path.includes('/api/auth/login')) {
      onUnauthorized?.();
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return null as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: Json) =>
    request<T>(path, { method: 'POST', body: body != null ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: Json) =>
    request<T>(path, { method: 'PATCH', body: body != null ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
};
