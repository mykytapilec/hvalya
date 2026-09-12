'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Release, type Track } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import TrackList from '../../components/tracks/TrackList';

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [releases, setReleases] = useState<Release[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [coverByAlbumId, setCoverByAlbumId] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [recError, setRecError] = useState('');

  useEffect(() => {
    if (isInitialized && !token) {
      router.replace('/login');
    }
  }, [isInitialized, token, router]);

  useEffect(() => {
    api.releases
      .findAll()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setReleases(sorted);
        const coverMap: Record<string, string | null> = {};
        sorted.forEach((release) => {
          coverMap[release.id] = release.coverUrl;
        });
        setCoverByAlbumId(coverMap);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!token) {
      setRecommendations([]);
      return;
    }
    api.users
      .getRecommendations(token, 10)
      .then(setRecommendations)
      .catch((err: unknown) =>
        setRecError(err instanceof Error ? err.message : 'Failed to load recommendations'),
      );
  }, [token]);

  const newestReleases = releases.slice(0, 8);

  if (!isInitialized || (isInitialized && !token)) return null;
  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <section style={{ marginBottom: 40 }}>
        <h1 style={{ marginBottom: 16 }}>New Releases</h1>
        {newestReleases.length === 0 ? (
          <p>No releases yet.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 20,
            }}
          >
            {newestReleases.map((release) => (
              <Link
                key={release.id}
                href={`/releases/${release.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {release.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={release.coverUrl}
                    alt={release.title}
                    style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 10 }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: 10,
                      background: 'var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                    }}
                  >
                    🎵
                  </div>
                )}
                <p style={{ marginTop: 8, fontWeight: 600, fontSize: 14 }}>{release.title}</p>
                <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                  {release.genre ?? release.type}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h1 style={{ marginBottom: 16 }}>For You</h1>
        {recError ? (
          <p style={{ color: 'var(--color-danger)' }}>{recError}</p>
        ) : recommendations.length === 0 ? (
          <p>Listen to a few tracks to get personalized recommendations.</p>
        ) : (
          <TrackList tracks={recommendations} coverByAlbumId={coverByAlbumId} />
        )}
      </section>
    </div>
  );
}
