'use client';

import { useEffect, useState } from 'react';
import ArtistList from '../../../components/artists/ArtistList';
import { api, type Artist } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function ArtistsPage() {
  const userId = useAuthStore((s) => s.userId);
  const role = useAuthStore((s) => s.role);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.artists
      .findAll()
      .then(setArtists)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const myArtistId =
    role === 'ARTIST' && userId ? artists.find((a) => a.userId === userId)?.id ?? null : null;

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Artists</h1>
      <ArtistList artists={artists} myArtistId={myArtistId} onArtistsChange={setArtists} />
    </div>
  );
}
