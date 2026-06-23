'use client';

import { useEffect, useState } from 'react';
import { api, type ArtistApplication } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function BecomeArtistPage() {
  const token = useAuthStore((s) => s.token);
  const [application, setApplication] = useState<ArtistApplication | null>(null);
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.artistApplications
      .findMine(token)
      .then(setApplication)
      .catch(() => setApplication(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    setIsSubmitting(true);
    try {
      const result = await api.artistApplications.apply(token, { bio, socialLinks });
      setApplication(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return <p>Please log in to apply as an artist.</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (application) {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1>Your Artist Application</h1>
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: 8,
            padding: 20,
            marginTop: 16,
          }}
        >
          <p>
            <strong>Status:</strong>{' '}
            <span
              style={{
                color:
                  application.status === 'APPROVED'
                    ? 'green'
                    : application.status === 'REJECTED'
                      ? 'red'
                      : '#888',
              }}
            >
              {application.status}
            </span>
          </p>
          <p style={{ marginTop: 12 }}>
            <strong>Bio:</strong>
            <br />
            {application.bio}
          </p>
          <p style={{ marginTop: 12 }}>
            <strong>Social Links:</strong>
            <br />
            {application.socialLinks}
          </p>
          {application.status === 'REJECTED' && application.rejectionReason && (
            <p style={{ marginTop: 12, color: 'red' }}>
              <strong>Rejection reason:</strong> {application.rejectionReason}
            </p>
          )}
          {application.status === 'APPROVED' && (
            <p style={{ marginTop: 12, color: 'green' }}>
              Congratulations! You are now an artist. Refresh and log in again to access
              artist tools.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Become an Artist</h1>
      <p style={{ color: '#666' }}>
        Tell us about yourself. Our team will review your application.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div>
          <label>Bio (min. 50 characters)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            minLength={50}
            rows={6}
            style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 16, padding: 10 }}
          />
        </div>
        <div>
          <label>Social Links</label>
          <textarea
            value={socialLinks}
            onChange={(e) => setSocialLinks(e.target.value)}
            required
            placeholder="https://soundcloud.com/..., https://instagram.com/..."
            rows={3}
            style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 16, padding: 10 }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
