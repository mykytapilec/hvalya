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

  if (role !== 'ARTIST') return null;
  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>My Profile</h1>

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
