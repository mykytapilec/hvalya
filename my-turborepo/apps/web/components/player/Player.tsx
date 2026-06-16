'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../app/store/player.store';

export default function Player() {
  const { currentTrack, isPlaying, pause, resume } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!currentTrack) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.audioUrl);
    } else {
      audioRef.current.src = currentTrack.audioUrl;
    }
    audioRef.current.play();
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  if (!currentTrack) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 16px',
        background: '#111',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <strong>{currentTrack.title}</strong>
      <button
        onClick={isPlaying ? pause : resume}
        style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '4px 12px', cursor: 'pointer' }}
      >
        {isPlaying ? '⏸ Pause' : '▶ Resume'}
      </button>
    </div>
  );
}