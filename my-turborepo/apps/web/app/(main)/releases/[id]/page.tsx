"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { api, type Release } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import { usePlayerStore } from '../../../store/player.store';

const RELEASE_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single',
  EP: 'EP',
  ALBUM: 'Album',
  SPLIT: 'Split',
  OTHER: 'Other',
};

export default function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const play = usePlayerStore((s) => s.play);
  const [release, setRelease] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.releases
      .findById(id)
      .then(setRelease)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load release'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handlePlay(trackId: string, title: string, artistId: string) {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    await play({ id: trackId, title, artistId }, token);
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;
  if (!release) return <p>Release not found.</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
        {release.coverUrl ? (
          <Image
            src={release.coverUrl}
            alt={release.title}
            width={160}
            height={160}
            style={{ objectFit: 'cover', borderRadius: 10 }}
            priority
            unoptimized
          />
        ) : (
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 10,
              background: 'var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
            }}
          >
            🎵
          </div>
        )}
        <div>
          <h1 style={{ marginBottom: 6 }}>{release.title}</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            {RELEASE_TYPE_LABELS[release.type]} · {new Date(release.releasedAt).toLocaleDateString()}
          </p>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>
            {release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {release.tracks.map((track, index) => (
          <li
            key={track.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ color: 'var(--color-muted)', width: 20, textAlign: 'right', fontSize: 13 }}>
                {index + 1}
              </span>
              <span style={{ fontWeight: 500 }}>{track.title}</span>
              <span style={{ color: 'var(--color-muted)', fontSize: 13 }}>
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>
            </div>
            <button onClick={() => handlePlay(track.id, track.title, track.artistId)}>
              ▶ Play
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}