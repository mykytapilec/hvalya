'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type Artist } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import ConfirmDeleteModal from '../../../../components/ui/ConfirmDeleteModal';

export default function AdminArtistsPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingArtist, setDeletingArtist] = useState<Artist | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    api.artists
      .findAll()
      .then(setArtists)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isInitialized, role, router]);

  if (!isInitialized) return <p>Loading...</p>;
  if (role !== 'ADMIN') return null;
  if (isLoading) return <p>Loading...</p>;

  async function handleConfirmDelete() {
    if (!deletingArtist) return;
    if (!token) throw new Error('Not authenticated');
    await api.artists.delete(token, deletingArtist.id);
    setArtists((prev) => prev.filter((a) => a.id !== deletingArtist.id));
    setDeletingArtist(null);
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Manage Artists</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {artists.map((artist) => (
          <div
            key={artist.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: 10,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-yellow))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {artist.name.charAt(0).toUpperCase()}
              </div>
              <strong>{artist.name}</strong>
            </div>
            <button className="btn-danger" onClick={() => setDeletingArtist(artist)}>
              Delete
            </button>
          </div>
        ))}
      </div>
      {artists.length === 0 && <p style={{ color: 'var(--color-muted)' }}>No artists yet.</p>}
      {deletingArtist && (
        <ConfirmDeleteModal
          title="Delete Artist"
          itemName={deletingArtist.name}
          onClose={() => setDeletingArtist(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}