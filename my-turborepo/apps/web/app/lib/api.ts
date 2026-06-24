const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  artistId: string;
  albumId: string | null;
}

export interface Artist {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ArtistApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ArtistApplication {
  id: string;
  userId: string;
  bio: string;
  socialLinks: string;
  status: ArtistApplicationStatus;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
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

  if (res.status === 204) {
    return undefined as T;
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
    findAll: (token?: string) => request<Track[]>('/tracks', {}, token),
    update: (token: string, id: string, data: Partial<Pick<Track, 'title' | 'duration' | 'audioUrl'>>) =>
      request<Track>(
        `/tracks/${id}`,
        { method: 'PATCH', body: JSON.stringify(data) },
        token,
      ),
    delete: (token: string, id: string) =>
      request<void>(`/tracks/${id}`, { method: 'DELETE' }, token),
  },
  artists: {
    findAll: (token?: string) => request<Artist[]>('/artists', {}, token),
    update: (token: string, id: string, data: Partial<Pick<Artist, 'name'>>) =>
      request<Artist>(
        `/artists/${id}`,
        { method: 'PATCH', body: JSON.stringify(data) },
        token,
      ),
    delete: (token: string, id: string) =>
      request<void>(`/artists/${id}`, { method: 'DELETE' }, token),
  },
  artistApplications: {
    apply: (token: string, data: { bio: string; socialLinks: string }) =>
      request<ArtistApplication>(
        '/artist-applications',
        { method: 'POST', body: JSON.stringify(data) },
        token,
      ),
    findMine: (token: string) =>
      request<ArtistApplication | null>('/artist-applications/me', {}, token),
    findPending: (token: string) =>
      request<ArtistApplication[]>('/artist-applications/pending', {}, token),
    approve: (token: string, id: string) =>
      request<ArtistApplication>(
        `/artist-applications/${id}/approve`,
        { method: 'PATCH' },
        token,
      ),
    reject: (token: string, id: string, rejectionReason: string) =>
      request<ArtistApplication>(
        `/artist-applications/${id}/reject`,
        { method: 'PATCH', body: JSON.stringify({ rejectionReason }) },
        token,
      ),
  },
};
