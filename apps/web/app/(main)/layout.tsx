'use client';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import Player from '../../components/player/Player';
import Link from 'next/link';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div style={{ paddingBottom: 80, minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ padding: '14px 24px', background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-dark))', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, zIndex: 800, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 20, color: '#fff', fontWeight: 700, fontSize: 16 }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--brand-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🎵</span>
          Hvalya
        </Link>
        <NavLink href="/tracks">Tracks</NavLink>
        <NavLink href="/artists">Artists</NavLink>
        <NavLink href="/releases">Releases</NavLink>
        {role === 'ARTIST' && <NavLink href="/releases/new">New Release</NavLink>}
        {role === 'LISTENER' && <NavLink href="/become-artist">Become an Artist</NavLink>}
        {role === 'ARTIST' && <NavLink href="/profile">My Profile</NavLink>}
        {role === 'ADMIN' && <NavLink href="/admin/applications">Applications</NavLink>}
        {role === 'ADMIN' && <NavLink href="/admin/artists">Manage Artists</NavLink>}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          {role && (
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: 'var(--brand-blue-dark)', background: 'var(--brand-yellow)', padding: '4px 10px', borderRadius: 999 }}>
              {role}
            </span>
          )}
          {token ? (
            <button onClick={logout} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 13 }}>
              Logout
            </button>
          ) : (
            <NavLink href="/login">Login</NavLink>
          )}
        </div>
      </nav>
      <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>{children}</main>
      <Player />
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        fontWeight: 500,
        padding: '6px 10px',
        borderRadius: 6,
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
      }}
    >
      {children}
    </Link>  
  );
}
