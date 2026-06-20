'use client';

import { usePlayerStore } from "../../app/store/player.store";
import { useAuthStore } from "../../app/store/auth.store";

interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  artistId: string;
}

export default function TrackList({ tracks }: { tracks: Track[] }) {
  const play = usePlayerStore((s) => s.play);
  const role = useAuthStore((s) => s.role);
  const canManage = role === 'ARTIST' || role === 'ADMIN';

  if (tracks.length === 0) {
    return <p>No tracks yet.</p>;
  }

  return (
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => play(track)}>▶ Play</button>
            {canManage && (
              <>
                <button>Edit</button>
                <button style={{ color: 'red' }}>Delete</button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}