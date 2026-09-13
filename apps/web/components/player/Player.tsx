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

function modeIcon(mode: string): string {
  if (mode === 'shuffle') return '🔀';
  if (mode === 'repeat') return '🔂';
  return '➡️';
}

function modeLabel(mode: string): string {
  if (mode === 'shuffle') return 'Shuffle';
  if (mode === 'repeat') return 'Repeat';
  return 'Normal';
}

export default function Player() {
  const {
    currentTrack, queue, queueIndex, shuffleHistory, playbackMode,
    isPlaying, isLoading, error, isExpanded, position, duration, volume,
    pause, resume, expand, collapse, setPosition, setDuration, setVolume,
    playNext, playPrev, handleTrackEnded, cyclePlaybackMode,
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
    const handleEnded = () => { if (token) handleTrackEnded(token); };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    usePlayerStore.setState({
      seekTo: (seconds: number) => { audio.currentTime = seconds; setPosition(seconds); },
      restartTrack: () => {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        usePlayerStore.setState({ isPlaying: true, position: 0 });
      },
    });

    audio.play().catch(() => {});

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.play().catch(() => {}); } else { audioRef.current.pause(); }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) { audioRef.current.volume = volume; }
  }, [volume]);

  if (!currentTrack && !error && !isLoading) return null;

  const progressPct = duration > 0 ? (position / duration) * 100 : 0;
  const hasNext = playbackMode === 'shuffle' ? queue.length > 1 : queueIndex < queue.length - 1;
  const hasPrev = playbackMode === 'shuffle' ? shuffleHistory.length > 0 : queueIndex > 0;

  function handleSeek(e: ChangeEvent<HTMLInputElement>) {
    usePlayerStore.getState().seekTo(Number(e.target.value));
  }
  function handleVolumeChange(e: ChangeEvent<HTMLInputElement>) { setVolume(Number(e.target.value)); }
  function handleNext() { if (token && hasNext) playNext(token); }
  function handlePrev() { if (token && hasPrev) playPrev(token); }

  return (
    <>
      {!isExpanded && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', zIndex: 900, pointerEvents: 'none' }}>
          <div
            style={{
              pointerEvents: 'auto',
              width: 'calc(100% - 24px)',
              maxWidth: 900,
              marginBottom: 12,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(30,58,138,0.96), rgba(30,64,175,0.96))',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: 3, background: 'rgba(255,255,255,0.15)' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--brand-yellow)', transition: 'width 0.2s linear' }} />
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {error ? (
                <span style={{ color: '#fca5a5', fontSize: 14 }}>{error}</span>
              ) : isLoading ? (
                <span style={{ fontSize: 14 }}>Loading...</span>
              ) : (
                <>
                  <div onClick={() => currentTrack && expand()} style={{ cursor: currentTrack ? 'pointer' : 'default', position: 'relative' }}>
                    {currentTrack?.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentTrack.coverUrl} alt="" style={{ ...miniCoverImgStyle, boxShadow: isPlaying ? '0 0 0 2px var(--brand-yellow)' : 'none' }} />
                    ) : (
                      <div style={miniCoverPlaceholderStyle} />
                    )}
                  </div>
                  <strong onClick={() => currentTrack && expand()} style={{ width: 140, flexShrink: 0, fontSize: 13, fontWeight: 500, cursor: currentTrack ? 'pointer' : 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentTrack?.title}
                  </strong>

                  <button onClick={handlePrev} disabled={!hasPrev} style={miniIconButtonStyle(hasPrev)}>⏮</button>
                  <button onClick={() => (isPlaying ? pause() : resume())} style={miniButtonStyle}>
                    <span style={{ marginLeft: isPlaying ? 0 : 2 }}>{isPlaying ? '⏸' : '▶'}</span>
                  </button>
                  <button onClick={handleNext} disabled={!hasNext} style={miniIconButtonStyle(hasNext)}>⏭</button>
                  <button onClick={cyclePlaybackMode} title={modeLabel(playbackMode)} style={miniIconButtonStyle(true, playbackMode !== 'normal')}>
                    {modeIcon(playbackMode)}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 100 }}>
                    <span style={{ fontSize: 12 }}>🔈</span>
                    <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolumeChange} style={{ flex: 1, accentColor: 'var(--brand-yellow)' }} />
                  </div>

                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                    {formatTime(position)} / {formatTime(duration)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isExpanded && currentTrack && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, overflow: 'hidden', background: '#0a0a1a' }}>
          {currentTrack.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentTrack.coverUrl}
              alt=""
              style={{ position: 'absolute', inset: -40, width: 'calc(100% + 80px)', height: 'calc(100% + 80px)', objectFit: 'cover', filter: 'blur(50px) brightness(0.5)', transform: 'scale(1.1)' }}
            />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,26,0.55), rgba(10,10,26,0.9))' }} />

          <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, color: '#fff' }}>
            <div style={{ width: '100%' }}>
              <button onClick={collapse} style={collapseButtonStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>Minimize</span>
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 420 }}>
              {currentTrack.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentTrack.coverUrl} alt="" style={{ ...fullCoverImgStyle, boxShadow: isPlaying ? '0 0 0 4px var(--brand-yellow), 0 25px 70px rgba(0,0,0,0.5)' : '0 25px 70px rgba(0,0,0,0.5)', transition: 'box-shadow 0.3s ease' }} />
              ) : (
                <div style={fullCoverPlaceholderStyle} />
              )}
              <h2 style={{ marginTop: 32, fontSize: 24, textAlign: 'center' }}>{currentTrack.title}</h2>

              <div style={{ width: '100%', marginTop: 40 }}>
                <input type="range" min={0} max={duration || 0} step={0.1} value={position} onChange={handleSeek} style={{ width: '100%', accentColor: 'var(--brand-yellow)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4, color: 'rgba(255,255,255,0.7)' }}>
                  <span>{formatTime(position)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 20, marginTop: 32,
                  padding: '14px 24px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <button onClick={cyclePlaybackMode} title={modeLabel(playbackMode)} style={skipButtonStyle(true, playbackMode !== 'normal')}>
                  {modeIcon(playbackMode)}
                </button>
                <button onClick={handlePrev} disabled={!hasPrev} style={skipButtonStyle(hasPrev)}>⏮</button>
                <button onClick={() => (isPlaying ? pause() : resume())} style={playButtonStyle}>
                  <span style={{ marginLeft: isPlaying ? 0 : 3 }}>{isPlaying ? '⏸' : '▶'}</span>
                </button>
                <button onClick={handleNext} disabled={!hasNext} style={skipButtonStyle(hasNext)}>⏭</button>
                <div style={{ width: 44 }} />
              </div>
              <p style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{modeLabel(playbackMode)}</p>

              <div style={{ width: '100%', marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14 }}>🔈</span>
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolumeChange} style={{ flex: 1, accentColor: 'var(--brand-yellow)' }} />
                <span style={{ fontSize: 14 }}>🔊</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const miniCoverPlaceholderStyle: CSSProperties = { width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-yellow))', flexShrink: 0 };
const miniCoverImgStyle: CSSProperties = { width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 };
const fullCoverPlaceholderStyle: CSSProperties = { width: 260, height: 260, borderRadius: 20, background: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-yellow))', boxShadow: '0 25px 70px rgba(0,0,0,0.5)' };
const fullCoverImgStyle: CSSProperties = { width: 260, height: 260, borderRadius: 20, objectFit: 'cover' };

const miniButtonStyle: CSSProperties = { background: 'var(--brand-yellow)', border: 'none', color: '#171717', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1, flexShrink: 0 };

function miniIconButtonStyle(enabled: boolean, active = false): CSSProperties {
  return { background: active ? 'rgba(250,204,21,0.25)' : 'transparent', border: 'none', color: active ? 'var(--brand-yellow)' : '#fff', cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.35, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6, flexShrink: 0 };
}

const collapseButtonStyle: CSSProperties = { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999 };

const playButtonStyle: CSSProperties = { width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-yellow)', border: 'none', color: '#171717', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1, boxShadow: '0 8px 24px rgba(250,204,21,0.4)' };

function skipButtonStyle(enabled: boolean, active = false): CSSProperties {
  return { width: 44, height: 44, borderRadius: '50%', background: active ? 'rgba(250,204,21,0.25)' : 'rgba(255,255,255,0.1)', border: 'none', color: active ? 'var(--brand-yellow)' : '#fff', fontSize: 18, cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center' };
}