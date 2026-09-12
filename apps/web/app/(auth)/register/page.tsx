'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { accessToken } = await api.auth.register({ email, username, password });
      setToken(accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, var(--brand-blue-dark), var(--brand-blue))', padding: 24 }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 920, borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}>
        <div style={{ flex: 1, minWidth: 0, padding: '48px 40px', background: 'linear-gradient(160deg, var(--brand-blue), var(--brand-blue-dark))', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎵</div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>Hvalya</span>
          </div>
          <h1 style={{ fontSize: 28, lineHeight: 1.3, marginBottom: 16 }}>Join a platform built for independent artists.</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.6 }}>
            Create an account to start listening, or apply later to upload your own music and earn from every play.
          </p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FeatureRow icon="🎧" text="30 days free, no credit card required" />
            <FeatureRow icon="⭐" text="Recommendations tailored to your taste" />
            <FeatureRow icon="💸" text="Artists earn from every stream" />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, background: 'var(--modal-bg)', color: 'var(--modal-text)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: 22, marginBottom: 24 }}>Create your account</h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)', marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 16 }} />
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)', marginBottom: 4 }}>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 16 }} />
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)', marginBottom: 4 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 16 }} />
            {error && <p style={{ color: 'var(--color-danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px 14px', fontSize: 15 }}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p style={{ marginTop: 20, fontSize: 14, color: 'var(--color-muted)' }}>
            Already have an account? <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{text}</span>
    </div>
  );
}