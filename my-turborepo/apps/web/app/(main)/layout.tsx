'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import Player from '../../components/player/Player';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div style={{ paddingBottom: 80 }}>
      <nav style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', gap: 16, alignItems: 'center' }}>
        <a href="/tracks">Tracks</a>
        <a href="/artists">Artists</a>
        {role === 'LISTENER' && <a href="/become-artist">Become an Artist</a>}
        {role === 'ARTIST' && <a href="/profile">My Profile</a>}
        {role === 'ADMIN' && <a href="/admin/applications">Applications</a>}
        {role === 'ADMIN' && <a href="/admin/artists">Manage Artists</a>}
        {role && (
          <span style={{ marginLeft: 'auto', color: '#888', fontSize: 13 }}>
            {role}
          </span>
        )}
        {token ? (
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        ) : (
          <a href="/login">Login</a>
        )}
      </nav>
      <main style={{ padding: 16 }}>{children}</main>
      <Player />
    </div>
  );
}