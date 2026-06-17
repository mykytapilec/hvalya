'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import Player from '../../components/player/Player';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div style={{ paddingBottom: 80 }}>
      <nav style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', gap: 16 }}>
        <a href="/tracks">Tracks</a>
        <a href="/artists">Artists</a>
        <a href="/login" style={{ marginLeft: 'auto' }}>Login</a>
      </nav>
      <main style={{ padding: 16 }}>{children}</main>
      <Player />
    </div>
  );
}