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
  artistId: string;
  albumId: string | null;
  genres: string[];
}
export interface TrackPlayback {
  audioUrl: string;
}
export interface ReleaseTrack {
  id: string;
  title: string;
  duration: number;
  artistId: string;
  albumId: string | null;
  genres: string[];
}
export type ReleaseType = 'SINGLE' | 'EP' | 'ALBUM' | 'SPLIT' | 'OTHER';
export type Genre =
  | 'ROCK'
  | 'POP'
  | 'JAZZ'
  | 'HIP_HOP'
  | 'ELECTRONIC'
  | 'CLASSICAL'
  | 'METAL'
  | 'BLUES'
  | 'RNB'
  | 'FOLK'
  | 'INDIE'
  | 'PUNK'
  | 'REGGAE'
  | 'COUNTRY'
  | 'OTHER';
export interface Release {
  id: string;
  title: string;
  type: ReleaseType;
  coverUrl: string | null;
  releasedAt: string;
  genre: Genre | null;
  createdAt: string;
  updatedAt: string;
  artistIds: string[];
  tracks: ReleaseTrack[];
}
export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  socialLinks: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
export interface Subscription {
  id: string;
  userId: string;
  tier: 'FREE' | 'STANDARD';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  startedAt: string;
  trialEndsAt: string | null;
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
    const rawMessage = error?.message?.message ?? error?.message ?? 'Request failed';
    const message =
      typeof rawMessage === 'string'
        ? rawMessage
        : Array.isArray(rawMessage)
          ? rawMessage.join(', ')
          : 'Request failed';
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as T;
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
    findAll: (token?: string) => request<Track[]>('/tracks', {}, token),
    play: (token: string, id: string) =>
      request<TrackPlayback>(`/tracks/${id}/play`, {}, token),
  },
  releases: {
    findAll: () => request<Release[]>('/releases'),
    findById: (id: string) => request<Release>(`/releases/${id}`),
  },
  artists: {
    findMe: (token: string) => request<Artist>('/artists/me', {}, token),
    update: (token: string, id: string, data: Partial<Pick<Artist, 'name' | 'bio' | 'socialLinks'>>)=>
      request<Artist>(`/artists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
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