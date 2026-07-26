'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function BecomeArtistPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!token) return;
    if (!name.trim()) { setError('Artist name is required'); return; }
    if (!bio.trim()) { setError('Bio is required'); return; }
    setError('');
    setIsLoading(true);
    try {
      await api.artistApplications.apply(token, { name, bio, socialLinks });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <h1>Application Submitted</h1>
        <p style={{ color: 'var(--color-success)', marginTop: 12 }}>
          Your application has been submitted and is pending review.
        </p>
        <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: 16 }}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Become an Artist</h1>

      <label>Artist Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your artist or band name"
        style={{ width: '100%' }}
      />

      <label>Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell us about yourself and your music"
        style={{ width: '100%', minHeight: 120 }}
      />

      <label>Social Links (optional)</label>
      <input
        value={socialLinks}
        onChange={(e) => setSocialLinks(e.target.value)}
        placeholder="https://..."
        style={{ width: '100%' }}
      />

      {error && <p style={{ color: 'var(--color-danger)', marginTop: 12 }}>{error}</p>}

      <div className="modal-actions">
        <button className="btn-primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Application'}
        </button>
        <button onClick={() => router.back()}>Cancel</button>
      </div>
    </div>
  );
}