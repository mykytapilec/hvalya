'use client';

import { useEffect, useState } from 'react';
import { api, type Track } from '../../app/lib/api';
import { useAuthStore } from '../../app/store/auth.store';
import Modal from '../ui/Modal';

interface EditTrackModalProps {
  track: Track;
  onClose: () => void;
  onSaved: (track: Track) => void;
}

export default function EditTrackModal({ track, onClose, onSaved }: EditTrackModalProps) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState(track.title);
  const [audioUrl, setAudioUrl] = useState('');
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
      const updated = await api.tracks.update(token, track.id, { title, audioUrl });
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