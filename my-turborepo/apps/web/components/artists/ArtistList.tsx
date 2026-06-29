'use client';

import { type Artist } from "../../app/lib/api";

interface ArtistListProps {
  artists: Artist[];
  myArtistId?: string | null;
  onArtistsChange?: (artists: Artist[]) => void;
}

export default function ArtistList({ artists }: ArtistListProps) {
  if (artists.length === 0) {
    return <p>No artists yet.</p>;
  }

  return (
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
        </li>
      ))}
    </ul>
  );
}