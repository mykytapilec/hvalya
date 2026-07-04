'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type ReleaseType } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';

const RELEASE_TYPES: ReleaseType[] = ['SINGLE', 'EP', 'ALBUM', 'SPLIT', 'OTHER'];

interface TrackForm {
  title: string;
  audioMode: 'url' | 'file';
  audioUrl: string;
  audioFile: File | null;
}

function emptyTrack(): TrackForm {
  return { title: '', audioMode: 'url', audioUrl: '', audioFile: null };
}

async function getAudioDuration(source: File | string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = source instanceof File ? URL.createObjectURL(source) : source;
    audio.src = url;
    audio.addEventListener('loadedmetadata', () => {
      const duration = Math.round(audio.duration) || 0;
      if (source instanceof File) URL.revokeObjectURL(url);
      resolve(duration);
    });
    audio.addEventListener('error', () => resolve(0));
  });
}

export default function NewReleasePage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReleaseType>('SINGLE');
  const [releasedAt, setReleasedAt] = useState('');
  const [coverMode, setCoverMode] = useState<'url' | 'file'>('url');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tracks, setTracks] = useState<TrackForm[]>([emptyTrack()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isInitialized) return;
    if (role !== 'ARTIST') router.replace('/');
  }, [isInitialized, role, router]);

  if (!isInitialized || role !== 'ARTIST') return null;

  function updateTrack(index: number, patch: Partial<TrackForm>) {
    setTracks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function addTrack() {
    setTracks((prev) => [...prev, emptyTrack()]);
  }

  function removeTrack(index: number) {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!token) return;
    if (!title.trim()) { setError('Title is required'); return; }
    if (!releasedAt) { setError('Release date is required'); return; }
    setError('');
    setIsSubmitting(true);

    try {
      const resolvedTracks = await Promise.all(
        tracks.map(async (t) => {
          let audioUrl = t.audioUrl;
          if (t.audioMode === 'file' && t.audioFile) {
            const res = await api.tracks.upload(token, t.audioFile);
            audioUrl = res.audioUrl ?? '';
          }
          const duration = await getAudioDuration(
            t.audioMode === 'file' && t.audioFile ? t.audioFile : audioUrl,
          );
          return { title: t.title, duration, audioUrl };
        }),
      );

      const release = await api.releases.create(token, {
        title,
        type,
        releasedAt: new Date(releasedAt).toISOString(),
        coverUrl: coverMode === 'url' && coverUrl.trim() ? coverUrl.trim() : undefined,
        tracks: resolvedTracks,
      });

      if (coverMode === 'file' && coverFile) {
        await api.releases.uploadCover(token, release.id, coverFile);
      }

      router.push(`/releases/${release.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create release');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>New Release</h1>

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

      <h2 style={{ marginTop: 24, marginBottom: 12 }}>Tracks</h2>
      {tracks.map((track, index) => (
        <div key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Track {index + 1}</strong>
            {tracks.length > 1 && (
              <button className="btn-danger" onClick={() => removeTrack(index)}>Remove</button>
            )}
          </div>

          <label>Title</label>
          <input
            value={track.title}
            onChange={(e) => updateTrack(index, { title: e.target.value })}
            style={{ width: '100%' }}
          />

          <label>Audio</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={() => updateTrack(index, { audioMode: 'url' })} className={track.audioMode === 'url' ? 'btn-primary' : ''}>URL</button>
            <button onClick={() => updateTrack(index, { audioMode: 'file' })} className={track.audioMode === 'file' ? 'btn-primary' : ''}>Upload file</button>
          </div>
          {track.audioMode === 'url' ? (
            <input
              value={track.audioUrl}
              onChange={(e) => updateTrack(index, { audioUrl: e.target.value })}
              placeholder="https://..."
              style={{ width: '100%' }}
            />
          ) : (
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => updateTrack(index, { audioFile: e.target.files?.[0] ?? null })}
              style={{ width: '100%' }}
            />
          )}
        </div>
      ))}

      <button onClick={addTrack} style={{ marginBottom: 16 }}>+ Add Track</button>

      {error && <p style={{ color: 'var(--color-danger)', marginTop: 12 }}>{error}</p>}

      <div className="modal-actions">
        <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Release'}
        </button>
        <button onClick={() => router.back()}>Cancel</button>
      </div>
    </div>
  );
}