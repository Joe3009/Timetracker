// API helper for Pharen workflows and lists

// Cookie helper functions
function setCookie(name: string, value: string, days = 7): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Listen for auth token from parent (Pharen Hub)
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'PHAREN_AUTH' && event.data.payload?.token) {
      setCookie('jwt_token', event.data.payload.token);
      console.log('[api] Received auth token from parent (origin:', event.origin, ')');
    }
  });
  
  // Signal to parent that we're ready for auth token
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'PHAREN_READY' }, '*');
  }
}

async function request<T>(
  url: string,
  method: string,
  body?: any,
  auth = true
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getCookie('jwt_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  // CRUD methods
  get: <T>(url: string, auth = true) => request<T>(url, 'GET', undefined, auth),
  post: <T>(url: string, body: any, auth = true) => request<T>(url, 'POST', body, auth),
  put: <T>(url: string, body: any, auth = true) => request<T>(url, 'PUT', body, auth),
  patch: <T>(url: string, body: any, auth = true) => request<T>(url, 'PATCH', body, auth),
  delete: <T>(url: string, auth = true) => request<T>(url, 'DELETE', undefined, auth),

  // File upload (FormData)
  upload: async <T>(url: string, formData: FormData, auth = true): Promise<T> => {
    const headers: Record<string, string> = {};
    if (auth) {
      const token = getCookie('jwt_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    if (!res.ok) throw new Error(`Upload Error: ${res.status}`);
    return res.json();
  },

  // Streaming response (SSE/chunked)
  stream: async (url: string, body?: any, auth = true): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getCookie('jwt_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`Stream Error: ${res.status}`);
    return res.body!.getReader();
  },
};
