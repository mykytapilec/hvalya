const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

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

export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  socialLinks: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ArtistApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

export interface ReleaseTrack {
  id: string;
  title: string;
  duration: number;
  artistId: string;
  albumId: string | null;
  genres: string[];
}

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

async function uploadFile(
  path: string,
  file: File,
  token: string,
): Promise<{ audioUrl?: string; coverUrl?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const rawMessage = error?.message?.message ?? error?.message ?? 'Upload failed';
    const message = typeof rawMessage === 'string' ? rawMessage : 'Upload failed';
    throw new Error(message);
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
    play: (token: string, id: string) =>
      request<TrackPlayback>(`/tracks/${id}/play`, {}, token),
    upload: (token: string, file: File) =>
      uploadFile('/tracks/upload', file, token),
    update: (
      token: string,
      id: string,
      data: Partial<Pick<Track, 'title'>> & { audioUrl?: string; genre?: Genre },
    ) =>
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
    findMe: (token: string) => request<Artist>('/artists/me', {}, token),
    update: (
      token: string,
      id: string,
      data: Partial<Pick<Artist, 'name' | 'bio' | 'socialLinks'>>,
    ) =>
      request<Artist>(
        `/artists/${id}`,
        { method: 'PATCH', body: JSON.stringify(data) },
        token,
      ),
    delete: (token: string, id: string) =>
      request<void>(`/artists/${id}`, { method: 'DELETE' }, token),
  },
  releases: {
    findAll: () => request<Release[]>('/releases'),
    findById: (id: string) => request<Release>(`/releases/${id}`),
    create: (
      token: string,
      data: {
        title: string;
        type: ReleaseType;
        releasedAt: string;
        genre: Genre;
        coverUrl?: string;
        tracks: Array<{ title: string; duration: number; audioUrl: string }>;
      },
    ) =>
      request<Release>('/releases', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),
    update: (
      token: string,
      id: string,
      data: { title?: string; type?: ReleaseType; releasedAt?: string; genre?: Genre; coverUrl?: string },
    ) =>
      request<Release>(`/releases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, token),
    uploadCover: (token: string, id: string, file: File) =>
      uploadFile(`/releases/${id}/cover`, file, token),
    delete: (token: string, id: string) =>
      request<void>(`/releases/${id}`, { method: 'DELETE' }, token),
  },
  artistApplications: {
    apply: (token: string, data: { name: string; bio: string; socialLinks: string }) =>
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