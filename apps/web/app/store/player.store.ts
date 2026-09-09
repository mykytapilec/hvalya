'use client';
import { create } from 'zustand';
import { api, resolveAudioUrl } from '../lib/api';

interface PlayableTrack {
  id: string;
  title: string;
  artistId: string;
  coverUrl?: string | null;
}
interface CurrentTrack extends PlayableTrack {
  audioUrl: string;
}
export type PlaybackMode = 'normal' | 'shuffle' | 'repeat';

interface PlayerState {
  currentTrack: CurrentTrack | null;
  queue: PlayableTrack[];
  queueIndex: number;
  shuffleHistory: PlayableTrack[];
  playbackMode: PlaybackMode;
  isPlaying: boolean;
  isLoading: boolean;
  error: string;
  isExpanded: boolean;
  position: number;
  duration: number;
  volume: number;
  play: (track: PlayableTrack, token: string, queue?: PlayableTrack[]) => Promise<void>;
  playNext: (token: string) => Promise<void>;
  playPrev: (token: string) => Promise<void>;
  handleTrackEnded: (token: string) => Promise<void>;
  cyclePlaybackMode: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  expand: () => void;
  collapse: () => void;
  setPosition: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number) => void;
  restartTrack: () => void;
}

function pickRandomExcluding(queue: PlayableTrack[], excludeId: string): PlayableTrack | null {
  const candidates = queue.filter((t) => t.id !== excludeId);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  shuffleHistory: [],
  playbackMode: 'normal',
  isPlaying: false,
  isLoading: false,
  error: '',
  isExpanded: false,
  position: 0,
  duration: 0,
  volume: 1,
  play: async (track, token, queue) => {
    set({ isLoading: true, error: '' });
    try {
      const { audioUrl } = await api.tracks.play(token, track.id);
      const existingQueue = get().queue;
      const resolvedQueue =
        queue ?? (existingQueue.some((t) => t.id === track.id) ? existingQueue : [track]);
      const index = resolvedQueue.findIndex((t) => t.id === track.id);
      set({
        currentTrack: { ...track, audioUrl: resolveAudioUrl(audioUrl) },
        queue: resolvedQueue,
        queueIndex: index >= 0 ? index : 0,
        isPlaying: true,
        isLoading: false,
        position: 0,
        duration: 0,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to play track',
        isLoading: false,
      });
    }
  },
  playNext: async (token) => {
    const { queue, queueIndex, currentTrack, playbackMode, shuffleHistory, play } = get();
    if (playbackMode === 'shuffle') {
      if (!currentTrack) return;
      const random = pickRandomExcluding(queue, currentTrack.id);
      if (!random) return;
      set({ shuffleHistory: [...shuffleHistory, currentTrack] });
      await play(random, token, queue);
      return;
    }
    const next = queue[queueIndex + 1];
    if (!next) return;
    await play(next, token, queue);
  },
  playPrev: async (token) => {
    const { queue, queueIndex, playbackMode, shuffleHistory, play } = get();
    if (playbackMode === 'shuffle') {
      const prevFromHistory = shuffleHistory[shuffleHistory.length - 1];
      if (!prevFromHistory) return;
      set({ shuffleHistory: shuffleHistory.slice(0, -1) });
      await play(prevFromHistory, token, queue);
      return;
    }
    const prev = queue[queueIndex - 1];
    if (!prev) return;
    await play(prev, token, queue);
  },
  handleTrackEnded: async (token) => {
    const { playbackMode, queue, playNext, restartTrack } = get();
    if (playbackMode === 'repeat') {
      restartTrack();
      return;
    }
    if (playbackMode === 'shuffle') {
      if (queue.length > 1) {
        await playNext(token);
      } else {
        restartTrack();
      }
      return;
    }
    const { queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      await playNext(token);
    } else {
      set({ isPlaying: false, position: 0 });
    }
  },
  cyclePlaybackMode: () => {
    const order: PlaybackMode[] = ['normal', 'shuffle', 'repeat'];
    const current = get().playbackMode;
    const next = order[(order.indexOf(current) + 1) % order.length];
    set({ playbackMode: next, shuffleHistory: [] });
  },
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () =>
    set({
      currentTrack: null,
      queue: [],
      queueIndex: -1,
      shuffleHistory: [],
      isPlaying: false,
      error: '',
      isExpanded: false,
      position: 0,
      duration: 0,
    }),
  expand: () => set({ isExpanded: true }),
  collapse: () => set({ isExpanded: false }),
  setPosition: (seconds) => set({ position: seconds }),
  setDuration: (seconds) => set({ duration: seconds }),
  setVolume: (volume) => set({ volume }),
  seekTo: () => {},
  restartTrack: () => {},
}));
