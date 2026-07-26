'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type Release, type ReleaseType, type Genre } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/auth.store';

const RELEASE_TYPES: ReleaseType[] = ['SINGLE', 'EP', 'ALBUM', 'SPLIT', 'OTHER'];
const GENRES: Genre[] = [
  'ROCK', 'POP', 'JAZZ', 'HIP_HOP', 'ELECTRONIC', 'CLASSICAL',
  'METAL', 'BLUES', 'RNB', 'FOLK', 'INDIE', 'PUNK', 'REGGAE', 'COUNTRY', 'OTHER',
];

export default function EditReleasePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [release, setRelease] = useState<Release | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReleaseType>('SINGLE');
  const [genre, setGenre] = useState<Genre>('OTHER');
  const [releasedAt, setReleasedAt] = useState('');
  const [coverMode, setCoverMode] = useState<'url' | 'file'>('url');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isInitialized) return;
    if (role !== 'ARTIST' && role !== 'ADMIN') {
      router.replace('/releases');
      return;
    }

    Promise.all([
      api.releases.findById(id),
      role === 'ARTIST' && userId ? api.artists.findAll() : Promise.resolve([]),
    ]).then(([r, artists]) => {
      setRelease(r);
      setTitle(r.title);
      setType(r.type);
      setGenre(r.genre ?? 'OTHER');
      setReleasedAt(r.releasedAt.slice(0, 10));
      setCoverUrl(r.coverUrl ?? '');

      if (role === 'ARTIST' && userId && Array.isArray(artists)) {
        const myArtist = artists.find((a) => a.userId === userId);
        const artistId = myArtist?.id ?? null;
        if (artistId && !r.artistIds.includes(artistId)) {
          router.replace('/releases');
        }
      }
    }).catch(() => router.replace('/releases'))
      .finally(() => setIsLoading(false));
  }, [isInitialized, role, userId, id, router]);

  async function handleSave() {
    if (!token) return;
    if (!releasedAt) { setError('Release date is required'); return; }
    setError('');
    setIsSaving(true);
    try {
      await api.releases.update(token, id, {
        title,
        type,
        genre,
        releasedAt: new Date(releasedAt).toISOString(),
        coverUrl: coverMode === 'url' && coverUrl.trim() ? coverUrl.trim() : undefined,
      });

      if (coverMode === 'file' && coverFile) {
        await api.releases.uploadCover(token, id, coverFile);
      }

      router.push(`/releases/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update release');
    } finally {
      setIsSaving(false);
    }
  }

  if (!isInitialized || isLoading) return <p>Loading...</p>;
  if (!release) return <p>Release not found.</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Edit Release</h1>

      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />

      <label>Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ReleaseType)}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, background: 'var(--modal-bg)', color: 'var(--modal-text)' }}
      >
        {RELEASE_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <label>Genre</label>
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value as Genre)}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, background: 'var(--modal-bg)', color: 'var(--modal-text)' }}
      >
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
        Changing this only affects the release. Existing tracks keep their own genre.
      </p>

      <label>Release Date</label>
      <input
        type="date"
        value={releasedAt}
        onChange={(e) => setReleasedAt(e.target.value)}
        style={{ width: '100%' }}
      />

      <label>Cover</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => setCoverMode('url')} className={coverMode === 'url' ? 'btn-primary' : ''}>URL</button>
        <button onClick={() => setCoverMode('file')} className={coverMode === 'file' ? 'btn-primary' : ''}>Upload file</button>
      </div>
      {coverMode === 'url' ? (
        <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." style={{ width: '100%' }} />
      ) : (
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} style={{ width: '100%' }} />
      )}

      {release.coverUrl && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>Current cover:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={release.coverUrl} alt="Current cover" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, marginTop: 4 }} />
        </div>
      )}

      {error && <p style={{ color: 'var(--color-danger)', marginTop: 12 }}>{error}</p>}

      <div className="modal-actions">
        <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => router.push(`/releases/${id}`)}>Cancel</button>
      </div>
    </div>
  );
}