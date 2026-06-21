const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
}

export interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  artistId: string;
  albumId: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'FREE' | 'STANDARD';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  startedAt: string;
  expiresAt: string | null;
}

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
    register: (data: RegisterPayload) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: LoginPayload) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  tracks: {
    findAll: () => request<Track[]>('/tracks'),
  },
  subscriptions: {
    getMine: (token: string) => request<Subscription>('/subscriptions/me', {}, token),
    upgrade: (token: string, tier: 'FREE' | 'STANDARD') =>
      request<Subscription>(
        '/subscriptions/me',
        { method: 'PATCH', body: JSON.stringify({ tier }) },
        token,
      ),
  },
  recommendations: {
    getMine: (token: string, limit = 10) =>
      request<Track[]>(`/users/me/recommendations?limit=${limit}`, {}, token),
  },
};
