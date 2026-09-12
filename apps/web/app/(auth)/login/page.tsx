'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { accessToken } = await api.auth.login({ email, password });
      setToken(accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: '80px auto', padding: '0 16px' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: 8 }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        No account? <a href="/register">Register</a>
      </p>

      <div
        style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: '1px solid var(--color-border)',
          color: 'var(--color-muted)',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <p>
          Welcome to <strong>Hvalya</strong> — a music streaming platform built to support and
          promote independent artists.
        </p>
        <p style={{ marginTop: 8 }}>
          Sign up and get <strong>30 days free</strong> to explore everything the platform offers.
          Within that time, you can switch to a Pro monthly plan to keep listening, or — if you're
          an artist — apply for the ability to upload your music and start earning from plays.
        </p>
      </div>
    </div>
  );
}
