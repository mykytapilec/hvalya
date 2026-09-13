'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, type Artist, type Release } from '../../../lib/api';

const RELEASE_TYPE_LABELS: Record<string, string> = { SINGLE: 'Single', EP: 'EP', ALBUM: 'Album', SPLIT: 'Split', OTHER: 'Other' };

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.artists.findAll(), api.releases.findAll()])
      .then(([artists, allReleases]) => {
        const found = artists.find((a) => a.id === id) ?? null;
        if (!found) { setError('Artist not found'); return; }
        setArtist(found);
        setReleases(allReleases.filter((r) => r.artistIds.includes(id)));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load artist'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>;
  if (!artist) return <p>Artist not found.</p>;

  const socialLink = artist.socialLinks;

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: 28, borderRadius: 16, background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-dark))', color: '#fff', marginBottom: 32 }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--brand-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: 'var(--brand-blue-dark)', flexShrink: 0 }}>
          {artist.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--brand-yellow)', marginBottom: 6 }}>Artist</p>
          <h1 style={{ fontSize: 30, marginBottom: 10 }}>{artist.name}</h1>
          {artist.bio && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: 560 }}>{artist.bio}</p>}
          {socialLink && <a href={socialLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 13, color: 'var(--brand-yellow)', fontWeight: 600 }}>Link: {socialLink}</a>}
        </div>
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Releases {releases.length > 0 ? `(${releases.length})` : ''}</h2>
      {releases.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>No releases yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
          {releases.map((release) => (
            <Link key={release.id} href={`/releases/${release.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {release.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={release.coverUrl} alt={release.title} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 10 }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 10, background: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-yellow))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎵</div>
              )}
              <p style={{ marginTop: 8, fontWeight: 600, fontSize: 14 }}>{release.title}</p>
              <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>{RELEASE_TYPE_LABELS[release.type]}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
