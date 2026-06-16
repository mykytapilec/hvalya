'use client';

import { usePlayerStore } from "../../app/store/player.store";

interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  artistId: string;
}

export default function TrackList({ tracks }: { tracks: Track[] }) {
  const play = usePlayerStore((s) => s.play);

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
          <button onClick={() => play(track)}>▶ Play</button>
        </li>
      ))}
    </ul>
  );
}