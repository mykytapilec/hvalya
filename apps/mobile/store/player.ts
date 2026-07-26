import { create } from 'zustand';
import { api, type Track } from '../lib/api';

interface PlayableTrack {
  id: string;
  title: string;
  artistId: string;
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
  play: (track: PlayableTrack, token: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  expand: () => void;
  collapse: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  error: '',
  isExpanded: false,

  play: async (track, token) => {
    set({ isLoading: true, error: '' });
    try {
      const { audioUrl } = await api.tracks.play(token, track.id);
      set({ currentTrack: { ...track, audioUrl }, isPlaying: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to play track',
        isLoading: false,
      });
    }
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ currentTrack: null, isPlaying: false, error: '', isExpanded: false }),
  expand: () => set({ isExpanded: true }),
  collapse: () => set({ isExpanded: false }),
}));