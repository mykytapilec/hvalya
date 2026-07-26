'use client';

import { useEffect, useState } from 'react';
import TrackList from '../../../components/tracks/TrackList';
import { api, type Track } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function TracksPage() {
  const userId = useAuthStore((s) => s.userId);
  const role = useAuthStore((s) => s.role);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [myArtistId, setMyArtistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.tracks.findAll(),
      role === 'ARTIST' ? api.artists.findAll() : Promise.resolve([]),
    ])
      .then(([tracksResult, artistsResult]) => {
        setTracks(tracksResult);
        if (role === 'ARTIST' && userId) {
          const mine = artistsResult.find((a) => a.userId === userId);
          setMyArtistId(mine?.id ?? null);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [role, userId]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Tracks</h1>
      <TrackList tracks={tracks} myArtistId={myArtistId} onTracksChange={setTracks} />
    </div>
  );
}
