'use client';

import { useEffect, useState } from 'react';
import { api, type ArtistApplication } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';

export default function AdminApplicationsPage() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!token || role !== 'ADMIN') {
      setIsLoading(false);
      return;
    }
    loadApplications();
  }, [token, role]);

  function loadApplications() {
    if (!token) return;
    setIsLoading(true);
    api.artistApplications
      .findPending(token)
      .then(setApplications)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setIsLoading(false));
  }

  async function handleApprove(id: string) {
    if (!token) return;
    try {
      await api.artistApplications.approve(token, id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    }
  }

  async function handleReject(id: string) {
    if (!token || !rejectionReason.trim()) return;
    try {
      await api.artistApplications.reject(token, id, rejectionReason);
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setRejectingId(null);
      setRejectionReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    }
  }

  if (role !== 'ADMIN') {
    return <p>You don&apos;t have permission to view this page.</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Artist Applications</h1>
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {applications.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>No pending applications.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map((app) => (
            <div
              key={app.id}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 20,
                borderTop: '4px solid var(--brand-blue)',
              }}
            >
              <p>
                <strong>Bio:</strong>
                <br />
                {app.bio}
              </p>
              <p style={{ marginTop: 12 }}>
                <strong>Social Links:</strong>
                <br />
                {app.socialLinks}
              </p>
              <p style={{ marginTop: 12, color: 'var(--color-muted)', fontSize: 13 }}>
                Submitted: {new Date(app.createdAt).toLocaleString()}
              </p>

              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={() => handleApprove(app.id)}>Approve</button>
                <button className="btn-danger" onClick={() => setRejectingId(app.id)}>
                  Reject
                </button>
              </div>

              {rejectingId === app.id && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    rows={2}
                    style={{ display: 'block', width: '100%', marginBottom: 8 }}
                  />
                  <button className="btn-danger" onClick={() => handleReject(app.id)}>Confirm Reject</button>
                  <button
                    onClick={() => {
                      setRejectingId(null);
                      setRejectionReason('');
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}