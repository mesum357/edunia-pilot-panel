export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path.startsWith('http') ? path : `${BACKEND_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const url = path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
  return res.json();
}

export function toAbsoluteUrl(possiblyRelativePath?: string | null): string | null {
  if (!possiblyRelativePath) return null;
  if (possiblyRelativePath.startsWith('http://') || possiblyRelativePath.startsWith('https://')) {
    return possiblyRelativePath;
  }
  if (possiblyRelativePath.startsWith('/')) {
    return `${BACKEND_URL}${possiblyRelativePath}`;
  }
  return `${BACKEND_URL}/${possiblyRelativePath}`;
}









