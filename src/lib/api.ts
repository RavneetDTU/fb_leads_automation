// TODO(security): API token is read from AuthContext (in-memory only, never from localStorage/sessionStorage)
// This prevents XSS-based token theft while still allowing the admin tool to function.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.wati.ayurvedicpromise.com';

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(
    status: number,
    detail: string,
    message?: string,
  ) {
    super(message ?? detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = { detail: res.statusText };
  }

  if (!res.ok) {
    if (res.status === 401) {
      try {
        sessionStorage.removeItem('jarvis_admin_token');
      } catch {
        // Ignore sessionStorage errors
      }
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const detail =
      (body as { detail?: string })?.detail ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, detail);
  }

  return body as T;
}

// Typed API helpers — each function accepts a token as first param
export function get<T>(path: string, token: string): Promise<T> {
  return request<T>(path, token);
}

export function post<T>(path: string, token: string, body: unknown): Promise<T> {
  return request<T>(path, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function patch<T>(path: string, token: string, body: unknown): Promise<T> {
  return request<T>(path, token, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function put<T>(path: string, token: string, body: unknown): Promise<T> {
  return request<T>(path, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function del<T>(path: string, token: string): Promise<T> {
  return request<T>(path, token, { method: 'DELETE' });
}
