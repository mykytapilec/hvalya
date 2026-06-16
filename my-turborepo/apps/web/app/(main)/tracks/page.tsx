import TrackList from '../../../components/tracks/TrackList';
import { api } from '../../lib/api';

export default async function TracksPage() {
  const tracks = await api.tracks.findAll();
  return (
    <div>
      <h1>Tracks</h1>
      <TrackList tracks={tracks} />
    </div>
  );
}