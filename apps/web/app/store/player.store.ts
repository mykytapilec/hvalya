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
interface PlayerState {
  currentTrack: CurrentTrack | null;
  queue: PlayableTrack[];
  queueIndex: number;
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
  pause: () => void;
  resume: () => void;
  stop: () => void;
  expand: () => void;
  collapse: () => void;
  setPosition: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
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
    const { queue, queueIndex, play } = get();
    if (queueIndex < 0 || queueIndex >= queue.length - 1) return;
    await play(queue[queueIndex + 1], token, queue);
  },
  playPrev: async (token) => {
    const { queue, queueIndex, play } = get();
    if (queueIndex <= 0) return;
    await play(queue[queueIndex - 1], token, queue);
  },
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () =>
    set({
      currentTrack: null,
      queue: [],
      queueIndex: -1,
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
}));
