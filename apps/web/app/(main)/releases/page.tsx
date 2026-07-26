'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type Release, type Artist } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import ConfirmDeleteModal from '../../../components/ui/ConfirmDeleteModal';

const RELEASE_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single', EP: 'EP', ALBUM: 'Album', SPLIT: 'Split', OTHER: 'Other',
};

export default function ReleasesPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const [releases, setReleases] = useState<Release[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingRelease, setDeletingRelease] = useState<Release | null>(null);

  useEffect(() => {
    Promise.all([api.releases.findAll(), api.artists.findAll()])
      .then(([r, a]) => { setReleases(r); setArtists(a); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const myArtistId = role === 'ARTIST' && userId
    ? artists.find((a) => a.userId === userId)?.id ?? null
    : null;

  function canManage(release: Release): boolean {
    if (role === 'ADMIN') return true;
    if (role === 'ARTIST' && myArtistId) return release.artistIds.includes(myArtistId);
    return false;
  }

  function getArtistName(release: Release): string {
    const artist = artists.find((a) => release.artistIds.includes(a.id));
    return artist?.name ?? 'Unknown Artist';
  }

  async function handleConfirmDelete() {
    if (!deletingRelease || !token) throw new Error('Not authenticated');
    await api.releases.delete(token, deletingRelease.id);
    setReleases((prev) => prev.filter((r) => r.id !== deletingRelease.id));
    setDeletingRelease(null);
  }

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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={release.coverUrl}
                alt={release.title}
                style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }}
              />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 6, background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                🎵
              </div>
            )}
            <div style={{ flex: 1 }}>
              <a href={`/releases/${release.id}`} style={{ fontWeight: 600 }}>
                {getArtistName(release)} — {release.title}
              </a>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>
                {RELEASE_TYPE_LABELS[release.type]} · {release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''} · {new Date(release.releasedAt).toLocaleDateString()}
              </div>
            </div>
            {canManage(release) && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => router.push(`/releases/${release.id}/edit`)}>Edit</button>
                <button className="btn-danger" onClick={() => setDeletingRelease(release)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {deletingRelease && (
        <ConfirmDeleteModal
          title="Delete Release"
          itemName={deletingRelease.title}
          onClose={() => setDeletingRelease(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}