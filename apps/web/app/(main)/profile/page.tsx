'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type Artist } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function ProfilePage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [artist, setArtist] = useState<Artist | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (role !== 'ARTIST') {
      router.replace('/');
      return;
    }
    if (!token) return;

    api.artists
      .findMe(token)
      .then((a) => {
        setArtist(a);
        setName(a.name);
        setBio(a.bio ?? '');
        setSocialLinks(a.socialLinks ?? '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, [isInitialized, role, token, router]);

  if (!isInitialized) return <p>Loading...</p>;
  if (role !== 'ARTIST') return null;

  async function handleSave() {
    if (!token || !artist) return;
    setError('');
    setSuccess(false);
    setIsSaving(true);
    try {
      const updated = await api.artists.update(token, artist.id, { name, bio, socialLinks });
      setArtist(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 24,
          borderRadius: 12,
          background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-dark))',
          color: '#fff',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--brand-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: 'var(--brand-blue-dark)',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {name.charAt(0).toUpperCase() || '🎤'}
        </div>
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.7)' }}>Artist Profile</p>
          <h1 style={{ fontSize: 22 }}>{name || 'My Profile'}</h1>
        </div>
      </div>

      <label>Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />

      <label>Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        style={{ width: '100%', minHeight: 120 }}
      />

      <label>Social Links</label>
      <input
        value={socialLinks}
        onChange={(e) => setSocialLinks(e.target.value)}
        style={{ width: '100%' }}
      />

      {error && <p style={{ color: 'var(--color-danger)', marginTop: 12 }}>{error}</p>}
      {success && <p style={{ color: 'var(--color-success)', marginTop: 12 }}>Saved!</p>}

      <div className="modal-actions">
        <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}