'use client';

import { useState } from 'react';
import { useAuthStore } from "../../app/store/auth.store";
import { api, type Artist } from "../../app/lib/api";
import EditArtistModal from './EditArtistModal';

interface ArtistListProps {
  artists: Artist[];
  myArtistId?: string | null;
  onArtistsChange?: (artists: Artist[]) => void;
}

export default function ArtistList({ artists, myArtistId, onArtistsChange }: ArtistListProps) {
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  if (artists.length === 0) {
    return <p>No artists yet.</p>;
  }

  function canManage(artist: Artist): boolean {
    if (role === 'ADMIN') return true;
    if (role === 'ARTIST' && myArtistId) return artist.id === myArtistId;
    return false;
  }

  function handleSaved(updated: Artist) {
    setEditingArtist(null);
    onArtistsChange?.(artists.map((a) => (a.id === updated.id ? updated : a)));
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setDeleteError('');
    try {
      await api.artists.delete(token, id);
      onArtistsChange?.(artists.filter((a) => a.id !== id));
      setConfirmingDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete artist');
    }
  }

  return (
    <>
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
            {canManage(artist) && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setEditingArtist(artist)}>Edit</button>
                {confirmingDeleteId === artist.id ? (
                  <>
                    <span style={{ color: '#888', fontSize: 13 }}>Are you sure?</span>
                    <button onClick={() => handleDelete(artist.id)} style={{ color: 'red' }}>
                      Yes, delete
                    </button>
                    <button onClick={() => setConfirmingDeleteId(null)}>Cancel</button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmingDeleteId(artist.id)}
                    style={{ color: 'red' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}

      {editingArtist && (
        <EditArtistModal
          artist={editingArtist}
          onClose={() => setEditingArtist(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
