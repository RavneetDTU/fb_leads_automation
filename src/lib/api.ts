const PRODUCTION_API = 'https://wati.ayurvedicpromise.com';
const DEAD_API = 'https://api.wati.ayurvedicpromise.com';

function resolveBaseUrl(): string {
  const raw = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  if (import.meta.env.DEV && !raw) return '';
  if (!raw || raw === DEAD_API) return PRODUCTION_API;
  return raw;
}

const BASE_URL = resolveBaseUrl();

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
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
    const detail =
      (body as { detail?: string })?.detail ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, detail);
  }

  return body as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}
