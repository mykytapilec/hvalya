'use client';

import { useState } from 'react';
import { api, type Artist } from '../../app/lib/api';
import { useAuthStore } from '../../app/store/auth.store';

interface EditArtistModalProps {
  artist: Artist;
  onClose: () => void;
  onSaved: (artist: Artist) => void;
}

export default function EditArtistModal({ artist, onClose, onSaved }: EditArtistModalProps) {
  const token = useAuthStore((s) => s.token);
  const [name, setName] = useState(artist.name);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!token) return;
    setError('');
    setIsSaving(true);
    try {
      const updated = await api.artists.update(token, artist.id, { name });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update artist');
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
        <h2 style={{ marginTop: 0 }}>Edit Artist</h2>

        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
