interface Artist {
  id: string;
  name: string;
}

export default function ArtistList({ artists }: { artists: Artist[] }) {
  if (artists.length === 0) {
    return <p>No artists yet.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {artists.map((artist) => (
        <li
          key={artist.id}
          style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}
        >
          <strong>{artist.name}</strong>
        </li>
      ))}
    </ul>
  );
}