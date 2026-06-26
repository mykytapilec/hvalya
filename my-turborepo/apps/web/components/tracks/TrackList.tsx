'use client';

import { useState } from 'react';
import { usePlayerStore } from "../../app/store/player.store";
import { useAuthStore } from "../../app/store/auth.store";
import { api, type Track } from "../../app/lib/api";
import EditTrackModal from './EditTrackModal';

interface TrackListProps {
  tracks: Track[];
  myArtistId?: string | null;
  onTracksChange?: (tracks: Track[]) => void;
}

export default function TrackList({ tracks, myArtistId, onTracksChange }: TrackListProps) {
  const play = usePlayerStore((s) => s.play);
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  if (tracks.length === 0) {
    return <p>No tracks yet.</p>;
  }

  function canManage(track: Track): boolean {
    if (role === 'ADMIN') return true;
    if (role === 'ARTIST' && myArtistId) return track.artistId === myArtistId;
    return false;
  }

  function handleSaved(updated: Track) {
    setEditingTrack(null);
    onTracksChange?.(tracks.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setDeleteError('');
    try {
      await api.tracks.delete(token, id);
      onTracksChange?.(tracks.filter((t) => t.id !== id));
      setConfirmingDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete track');
    }
  }

  return (
    <>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tracks.map((track) => (
          <li
            key={track.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <div>
              <strong>{track.title}</strong>
              <span style={{ marginLeft: 8, color: '#888' }}>
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => play(track)}>▶ Play</button>
              {canManage(track) && (
                <>
                  <button onClick={() => setEditingTrack(track)}>Edit</button>
                  {confirmingDeleteId === track.id ? (
                    <>
                      <span style={{ color: '#888', fontSize: 13 }}>Are you sure?</span>
                      <button onClick={() => handleDelete(track.id)} style={{ color: 'red' }}>
                        Yes, delete
                      </button>
                      <button onClick={() => setConfirmingDeleteId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmingDeleteId(track.id)}
                      style={{ color: 'red' }}
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}

      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}