'use client';

import { useState } from 'react';
import { api, type Track } from '../../app/lib/api';
import { useAuthStore } from '../../app/store/auth.store';

interface EditTrackModalProps {
  track: Track;
  onClose: () => void;
  onSaved: (track: Track) => void;
}

export default function EditTrackModal({ track, onClose, onSaved }: EditTrackModalProps) {
  const token = useAuthStore((s) => s.token);
  const [title, setTitle] = useState(track.title);
  const [audioUrl, setAudioUrl] = useState(track.audioUrl);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          width: 400,
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Edit Track</h2>

        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, marginBottom: 12 }}
        />

        <label>Audio URL</label>
        <input
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, marginBottom: 12 }}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
