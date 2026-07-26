'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, type Release } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import TrackList from '../../../../components/tracks/TrackList';

const RELEASE_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single', EP: 'EP', ALBUM: 'Album', SPLIT: 'Split', OTHER: 'Other',
};

export default function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.userId);
  const [release, setRelease] = useState<Release | null>(null);
  const [myArtistId, setMyArtistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.releases.findById(id),
      role === 'ARTIST' ? api.artists.findAll() : Promise.resolve([]),
    ])
      .then(([r, artistsResult]) => {
        setRelease(r);
        if (role === 'ARTIST' && userId) {
          const mine = artistsResult.find((a) => a.userId === userId);
          setMyArtistId(mine?.id ?? null);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load release'))
      .finally(() => setIsLoading(false));
  }, [id, role, userId]);

  function canManageRelease(): boolean {
    if (!release) return false;
    if (role === 'ADMIN') return true;
    if (role === 'ARTIST' && myArtistId) return release.artistIds.includes(myArtistId);
    return false;
  }

  function handleTracksChange(updatedTracks: Release['tracks']) {
    setRelease((prev) => (prev ? { ...prev, tracks: updatedTracks } : prev));
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;
  if (!release) return <p>Release not found.</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
        {release.coverUrl ? (
          //eslint-disable-next-line @next/next/no-img-element
          <img
            src={release.coverUrl}
            alt={release.title}
            style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 10 }}
          />
        ) : (
          <div style={{ width: 160, height: 160, borderRadius: 10, background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            🎵
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ marginBottom: 6 }}>{release.title}</h1>
            {canManageRelease() && (
              <Link href={`/releases/${id}/edit`}>
                <button>Edit Release</button>
              </Link>
            )}
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            {RELEASE_TYPE_LABELS[release.type]}
            {release.genre ? ` · ${release.genre}` : ''} · {new Date(release.releasedAt).toLocaleDateString()}
          </p>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>
            {release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <TrackList
        tracks={release.tracks}
        myArtistId={myArtistId}
        onTracksChange={handleTracksChange}
      />
    </div>
  );
}