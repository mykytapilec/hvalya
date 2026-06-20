'use client';

import { useAuthStore } from "../../app/store/auth.store";

interface Artist {
  id: string;
  name: string;
}

export default function ArtistList({ artists }: { artists: Artist[] }) {
  const role = useAuthStore((s) => s.role);
  const canManage = role === 'ARTIST' || role === 'ADMIN';

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
          {canManage && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button>Edit</button>
              <button style={{ color: 'red' }}>Delete</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}