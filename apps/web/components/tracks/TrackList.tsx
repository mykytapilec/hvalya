'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '../../app/store/player.store';
import { useAuthStore } from '../../app/store/auth.store';
import { api, type Track } from '../../app/lib/api';
import EditTrackModal from './EditTrackModal';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';
interface TrackListProps {
  tracks: Track[];
  myArtistId?: string | null;
  onTracksChange?: (tracks: Track[]) => void;
  releaseCoverUrl?: string | null;
}
export default function TrackList({ tracks, myArtistId, onTracksChange, releaseCoverUrl }: TrackListProps) {
  const router = useRouter();
  const play = usePlayerStore((s) => s.play);
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
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
  async function handleConfirmDelete() {
    if (!deletingTrack) return;
    if (!token) {
      throw new Error('Not authenticated');
    }
    await api.tracks.delete(token, deletingTrack.id);
    onTracksChange?.(tracks.filter((t) => t.id !== deletingTrack.id));
    setDeletingTrack(null);
  }
  async function handlePlay(track: Track) {
    if (!token) {
      router.push('/login');
      return;
    }
    await play({ ...track, coverUrl: releaseCoverUrl }, token);
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
              {track.genres.length > 0 && (
                <span style={{ marginLeft: 8, color: 'var(--color-muted)', fontSize: 12 }}>
                  {track.genres.join(', ')}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => handlePlay(track)}>▶ Play</button>
              {canManage(track) && (
                <>
                  <button onClick={() => setEditingTrack(track)}>Edit</button>
                  <button className="btn-danger" onClick={() => setDeletingTrack(track)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSaved={handleSaved}
        />
      )}
      {deletingTrack && (
        <ConfirmDeleteModal
          title="Delete Track"
          itemName={deletingTrack.title}
          onClose={() => setDeletingTrack(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}