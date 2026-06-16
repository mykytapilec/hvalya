import ArtistList from '../../../components/artists/ArtistList';
import { api } from '../../lib/api';

export default async function ArtistsPage() {
  const artists = await api.artists.findAll();
  return (
    <div>
      <h1>Artists</h1>
      <ArtistList artists={artists} />
    </div>
  );
}