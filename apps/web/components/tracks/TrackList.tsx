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
  coverByAlbumId?: Record<string, string | null>;
}
export default function TrackList({ tracks, myArtistId, onTracksChange, releaseCoverUrl, coverByAlbumId }: TrackListProps) {
  const router = useRouter();
  const play = usePlayerStore((s) => s.play);
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  if (tracks.length === 0) {
    return <p style={{ color: 'var(--color-muted)' }}>No tracks yet.</p>;
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
    if (!token) throw new Error('Not authenticated');
    await api.tracks.delete(token, deletingTrack.id);
    onTracksChange?.(tracks.filter((t) => t.id !== deletingTrack.id));
    setDeletingTrack(null);
  }
  function resolveCover(track: Track): string | null {
    if (releaseCoverUrl !== undefined) return releaseCoverUrl;
    if (coverByAlbumId && track.albumId) return coverByAlbumId[track.albumId] ?? null;
    return null;
  }
  async function handlePlay(track: Track) {
    if (!token) {
      router.push('/login');
      return;
    }
    const albumTracks = track.albumId ? tracks.filter((t) => t.albumId === track.albumId) : [track];
    const queue = albumTracks.map((t) => ({ ...t, coverUrl: resolveCover(t) }));
    await play({ ...track, coverUrl: resolveCover(track) }, token, queue);
  }
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tracks.map((track) => {
          const cover = resolveCover(track);
          return (
            <div
              key={track.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 12px',
                borderRadius: 10,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-yellow))', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
                <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                  {track.genres.length > 0 && ` · ${track.genres.join(', ')}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                <button className="btn-accent" onClick={() => handlePlay(track)}>▶ Play</button>
                {canManage(track) && (
                  <>
                    <button onClick={() => setEditingTrack(track)}>Edit</button>
                    <button className="btn-danger" onClick={() => setDeletingTrack(track)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {editingTrack && (
        <EditTrackModal track={editingTrack} onClose={() => setEditingTrack(null)} onSaved={handleSaved} />
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