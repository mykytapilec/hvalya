const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Request failed');
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; username: string; password: string }) =>
      request<{ accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  tracks: {
    findAll: (token?: string) =>
      request<any[]>('/tracks', {}, token),
  },
  artists: {
    findAll: (token?: string) =>
      request<any[]>('/artists', {}, token),
  },
};