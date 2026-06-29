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

  async function handleConfirmDelete() {
    if (!deletingArtist) return;
    if (!token) {
      throw new Error('Not authenticated');
    }
    await api.artists.delete(token, deletingArtist.id);
    setArtists((prev) => prev.filter((a) => a.id !== deletingArtist.id));
    setDeletingArtist(null);
  }

  if (role !== 'ADMIN') return null;
  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Manage Artists</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {artists.map((artist) => (
          <li
            key={artist.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <strong>{artist.name}</strong>
            <button className="btn-danger" onClick={() => setDeletingArtist(artist)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {artists.length === 0 && <p>No artists yet.</p>}

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
