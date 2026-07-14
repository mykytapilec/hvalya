'use client';

import { useEffect, useState } from 'react';
import { api, type Track, type Genre } from '../../app/lib/api';
import { useAuthStore } from '../../app/store/auth.store';
import Modal from '../ui/Modal';

const GENRES: Genre[] = [
  'ROCK', 'POP', 'JAZZ', 'HIP_HOP', 'ELECTRONIC', 'CLASSICAL',
  'METAL', 'BLUES', 'RNB', 'FOLK', 'INDIE', 'PUNK', 'REGGAE', 'COUNTRY', 'OTHER',
];

interface EditTrackModalProps {
  track: Track;
  onClose: () => void;
  onSaved: (track: Track) => void;
}

export default function EditTrackModal({ track, onClose, onSaved }: EditTrackModalProps) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState(track.title);
  const [audioUrl, setAudioUrl] = useState('');
  const [genre, setGenre] = useState<Genre | ''>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.tracks
      .play(token, track.id)
      .then((res) => setAudioUrl(res.audioUrl))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load audio URL'))
      .finally(() => setIsLoadingUrl(false));
  }, [token, track.id]);

  async function handleSave() {
    if (!token) return;
    setError('');
    setIsSaving(true);
    try {
      const updated = await api.tracks.update(token, track.id, {
        title,
        audioUrl,
        ...(genre ? { genre } : {}),
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update track');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal title="Edit Track" onClose={onClose}>
      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />

      <label>Audio URL</label>
      <input
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
        style={{ width: '100%' }}
        disabled={isLoadingUrl}
      />

      <label>Genre</label>
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value as Genre | '')}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, background: 'var(--modal-bg)', color: 'var(--modal-text)' }}
      >
        <option value="">
          {track.genres.length > 0 ? `Keep current (${track.genres.join(', ')})` : 'Keep current (none)'}
        </option>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
        Only changes if you pick a genre here — overrides the release&apos;s genre for this track.
      </p>

      {error && <p style={{ color: 'var(--color-danger)', marginTop: 12 }}>{error}</p>}

      <div className="modal-actions">
        <button className="btn-primary" onClick={handleSave} disabled={isSaving || isLoadingUrl}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}