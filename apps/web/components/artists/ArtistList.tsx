'use client';

import Link from 'next/link';
import { type Artist } from "../../app/lib/api";

interface ArtistListProps {
  artists: Artist[];
  myArtistId?: string | null;
  onArtistsChange?: (artists: Artist[]) => void;
}

export default function ArtistList({ artists }: ArtistListProps) {
  if (artists.length === 0) {
    return <p style={{ color: 'var(--color-muted)' }}>No artists yet.</p>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 20,
      }}
    >
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={`/artists/${artist.id}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 20,
            borderRadius: 12,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-yellow))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 12,
            }}
          >
            {artist.name.charAt(0).toUpperCase()}
          </div>
          <strong style={{ fontSize: 14 }}>{artist.name}</strong>
        </Link>
      ))}
    </div>
  );
}