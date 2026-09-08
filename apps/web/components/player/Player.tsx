'use client';

import { useEffect, useRef, type CSSProperties, type ChangeEvent } from 'react';
import { usePlayerStore } from '../../app/store/player.store';
import { useAuthStore } from '../../app/store/auth.store';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Player() {
  const {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    isLoading,
    error,
    isExpanded,
    position,
    duration,
    volume,
    pause,
    resume,
    expand,
    collapse,
    setPosition,
    setDuration,
    setVolume,
    playNext,
    playPrev,
  } = usePlayerStore();
  const token = useAuthStore((s) => s.token);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!currentTrack) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.audioUrl);
      audioRef.current.volume = volume;
    } else {
      audioRef.current.src = currentTrack.audioUrl;
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => setPosition(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => usePlayerStore.setState({ isPlaying: false, position: 0 });

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    usePlayerStore.setState({
      seekTo: (seconds: number) => {
        audio.currentTime = seconds;
        setPosition(seconds);
      },
    });

    audio.play().catch(() => {
      /* ignore autoplay/interrupt errors */
    });

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        /* ignore autoplay/interrupt errors */
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentTrack && !error && !isLoading) return null;

  const progressPct = duration > 0 ? (position / duration) * 100 : 0;
  const hasNext = queueIndex >= 0 && queueIndex < queue.length - 1;
  const hasPrev = queueIndex > 0;

  function handleSeek(e: ChangeEvent<HTMLInputElement>) {
    usePlayerStore.getState().seekTo(Number(e.target.value));
  }

  function handleVolumeChange(e: ChangeEvent<HTMLInputElement>) {
    setVolume(Number(e.target.value));
  }

  function handleNext() {
    if (!token || !hasNext) return;
    playNext(token);
  }

  function handlePrev() {
    if (!token || !hasPrev) return;
    playPrev(token);
  }

  return (
    <>
      {!isExpanded && (
        <div
          onClick={() => currentTrack && expand()}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--brand-blue-dark)',
            color: '#fff',
            cursor: currentTrack ? 'pointer' : 'default',
            zIndex: 900,
          }}
        >
          <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progressPct}%`,
                background: 'var(--brand-yellow)',
                transition: 'width 0.2s linear',
              }}
            />
          </div>
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {error ? (
              <span style={{ color: '#fca5a5', fontSize: 14 }}>{error}</span>
            ) : isLoading ? (
              <span style={{ fontSize: 14 }}>Loading...</span>
            ) : (
              <>
                {currentTrack?.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentTrack.coverUrl} alt="" style={miniCoverImgStyle} />
                ) : (
                  <div style={miniCoverPlaceholderStyle} />
                )}
                <strong style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{currentTrack?.title}</strong>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isPlaying ? pause() : resume();
                  }}
                  style={miniButtonStyle}
                >
                  <span style={{ marginLeft: isPlaying ? 0 : 2 }}>{isPlaying ? '⏸' : '▶'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isExpanded && currentTrack && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(160deg, var(--brand-blue-dark), var(--brand-blue))',
            color: '#fff',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <div style={{ width: '100%' }}>
            <button onClick={collapse} style={collapseButtonStyle}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>Minimize</span>
            </button>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: 420,
            }}
          >
            {currentTrack.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentTrack.coverUrl} alt="" style={fullCoverImgStyle} />
            ) : (
              <div style={fullCoverPlaceholderStyle} />
            )}
            <h2 style={{ marginTop: 32, fontSize: 24, textAlign: 'center' }}>{currentTrack.title}</h2>

            <div style={{ width: '100%', marginTop: 40 }}>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={position}
                onChange={handleSeek}
                style={{ width: '100%', accentColor: 'var(--brand-yellow)' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginTop: 4,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                <span>{formatTime(position)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 32 }}>
              <button onClick={handlePrev} disabled={!hasPrev} style={skipButtonStyle(hasPrev)}>
                ⏮
              </button>
              <button onClick={() => (isPlaying ? pause() : resume())} style={playButtonStyle}>
                <span style={{ marginLeft: isPlaying ? 0 : 3 }}>{isPlaying ? '⏸' : '▶'}</span>
              </button>
              <button onClick={handleNext} disabled={!hasNext} style={skipButtonStyle(hasNext)}>
                ⏭
              </button>
            </div>

            <div style={{ width: '100%', marginTop: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>🔈</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                style={{ flex: 1, accentColor: 'var(--brand-yellow)' }}
              />
              <span style={{ fontSize: 14 }}>🔊</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const miniCoverPlaceholderStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 6,
  background: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-yellow))',
  flexShrink: 0,
};

const miniCoverImgStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 6,
  objectFit: 'cover',
  flexShrink: 0,
};

const fullCoverPlaceholderStyle: CSSProperties = {
  width: 240,
  height: 240,
  borderRadius: 16,
  background: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-yellow))',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

const fullCoverImgStyle: CSSProperties = {
  width: 240,
  height: 240,
  borderRadius: 16,
  objectFit: 'cover',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

const miniButtonStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  color: '#fff',
  width: 32,
  height: 32,
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  lineHeight: 1,
};

const collapseButtonStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: 0,
};

const playButtonStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'var(--brand-yellow)',
  border: 'none',
  color: '#171717',
  fontSize: 24,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  lineHeight: 1,
};

function skipButtonStyle(enabled: boolean): CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: '#fff',
    fontSize: 18,
    cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.35,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}
