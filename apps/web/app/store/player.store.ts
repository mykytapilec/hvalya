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
  isPlaying: boolean;
  isLoading: boolean;
  error: string;
  isExpanded: boolean;
  position: number;
  duration: number;
  play: (track: PlayableTrack, token: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  expand: () => void;
  collapse: () => void;
  setPosition: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  seekTo: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  error: '',
  isExpanded: false,
  position: 0,
  duration: 0,

  play: async (track, token) => {
    set({ isLoading: true, error: '' });
    try {
      const { audioUrl } = await api.tracks.play(token, track.id);
      set({
        currentTrack: { ...track, audioUrl: resolveAudioUrl(audioUrl) },
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

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () =>
    set({
      currentTrack: null,
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
  seekTo: () => {},
}));