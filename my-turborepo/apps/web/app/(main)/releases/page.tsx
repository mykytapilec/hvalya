'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { api, type Release } from '../../lib/api';

const RELEASE_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single',
  EP: 'EP',
  ALBUM: 'Album',
  SPLIT: 'Split',
  OTHER: 'Other',
};

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.releases
      .findAll()
      .then(setReleases)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Releases</h1>
      {releases.length === 0 && <p>No releases yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {releases.map((release) => (
          <li
            key={release.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '12px 0',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {release.coverUrl ? (
              <Image
                src={release.coverUrl}
                alt={release.title}
                width={56}
                height={56}
                style={{ objectFit: 'cover', borderRadius: 6 }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 6,
                  background: 'var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                🎵
              </div>
            )}
            <div style={{ flex: 1 }}>
              <a href={`/releases/${release.id}`} style={{ fontWeight: 600 }}>
                {release.title}
              </a>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>
                {RELEASE_TYPE_LABELS[release.type]} · {release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''} · {new Date(release.releasedAt).toLocaleDateString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}