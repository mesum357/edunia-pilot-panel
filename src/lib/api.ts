// Get backend URL from environment variable
const envBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const BACKEND_URL = envBackendUrl || (
  import.meta.env.PROD 
    ? (() => {
        console.error('❌ VITE_BACKEND_URL is not set! Please set the environment variable in Render dashboard.');
        return 'http://localhost:3000'; // Fallback
      })()
    : 'http://localhost:3000'
);

// Log the backend URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🌐 Control Panel Backend URL:', BACKEND_URL);
  if (!envBackendUrl) {
    console.warn('⚠️ VITE_BACKEND_URL not set. Using default: http://localhost:3000');
    console.warn('💡 Create a .env file in the Control Panel root with: VITE_BACKEND_URL=https://your-backend-url.onrender.com');
  }
}

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

export async function apiDelete<T>(path: string): Promise<T> {
  const url = path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}









