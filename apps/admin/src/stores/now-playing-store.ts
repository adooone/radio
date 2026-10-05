import { create } from 'zustand';

export interface NowPlayingTrack {
  title: string;
  artist: string;
  album?: string;
  audioUrl?: string;
}

interface NowPlayingStore {
  currentTrack: NowPlayingTrack | null;
  playlist: NowPlayingTrack[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loop: boolean;

  playTrack: (
    track: NowPlayingTrack | NowPlayingTrack[],
    startIndex?: number,
  ) => void;
  togglePlayPause: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  toggleLoop: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

// Singleton Audio element — lives outside React, survives all route changes
let audio: HTMLAudioElement | null = null;

const getAudio = (): HTMLAudioElement => {
  if (!audio) {
    audio = new Audio();
  }
  return audio;
};

export const useNowPlayingStore = create<NowPlayingStore>()((set, get) => {
  // Wire up audio events once the store is created
  const el = getAudio();

  // Helper function to play a track by index from the playlist
  const playTrackByIndex = (index: number) => {
    const { playlist } = get();
    if (!playlist || index < 0 || index >= playlist.length) {
      return;
    }

    const track = playlist[index];
    const src = track.audioUrl || '';

    if (!src) {
      return;
    }

    el.src = src;
    el.load();
    set({
      currentTrack: track,
      currentIndex: index,
      currentTime: 0,
      duration: 0,
    });
    el.play().catch((error) => {
      console.error('Failed to play track:', error);
      set({ isPlaying: false });
    });
  };

  el.addEventListener('timeupdate', () => {
    set({ currentTime: el.currentTime });
  });

  el.addEventListener('loadedmetadata', () => {
    set({ duration: el.duration });
  });

  el.addEventListener('durationchange', () => {
    set({ duration: el.duration });
  });

  el.addEventListener('ended', () => {
    const { playlist, currentIndex, loop } = get();

    // If we have a playlist, try to play the next track
    if (playlist && playlist.length > 0) {
      const nextIndex = currentIndex + 1;

      if (nextIndex < playlist.length) {
        // Play next track
        playTrackByIndex(nextIndex);
      } else if (loop) {
        // Loop back to the first track
        playTrackByIndex(0);
      } else {
        // End of playlist, stop
        set({ isPlaying: false, currentTime: 0 });
      }
    } else {
      // No playlist, just stop
      set({ isPlaying: false, currentTime: 0 });
    }
  });

  el.addEventListener('pause', () => {
    set({ isPlaying: false });
  });

  el.addEventListener('play', () => {
    set({ isPlaying: true });
  });

  return {
    currentTrack: null,
    playlist: [],
    currentIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    loop: false,

    playTrack: (trackOrPlaylist, startIndex = 0) => {
      const el = getAudio();

      // Check if it's an array (playlist) or single track
      const isPlaylist = Array.isArray(trackOrPlaylist);
      const playlist = isPlaylist ? trackOrPlaylist : [trackOrPlaylist];
      const index = isPlaylist ? startIndex : 0;

      if (playlist.length === 0) {
        return;
      }

      const track = playlist[index];
      const current = get().currentTrack;

      // If it's the same track, just toggle play/pause
      if (current?.audioUrl === track.audioUrl && el.src) {
        if (el.paused) {
          el.play();
        } else {
          el.pause();
        }
        return;
      }

      // Set the playlist and play the track at the specified index
      set({ playlist, currentIndex: index });
      playTrackByIndex(index);
    },

    togglePlayPause: () => {
      const el = getAudio();
      if (el.paused) {
        el.play();
      } else {
        el.pause();
      }
    },

    pause: () => {
      getAudio().pause();
    },

    stop: () => {
      const el = getAudio();
      el.pause();
      el.currentTime = 0;
      el.src = '';
      set({
        currentTrack: null,
        playlist: [],
        currentIndex: -1,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      });
    },

    seek: (time: number) => {
      const el = getAudio();
      el.currentTime = time;
      set({ currentTime: time });
    },

    toggleLoop: () => {
      set((state) => ({ loop: !state.loop }));
    },

    playNext: () => {
      const { playlist, currentIndex } = get();
      if (playlist && playlist.length > 0 && currentIndex >= 0) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < playlist.length) {
          playTrackByIndex(nextIndex);
        } else if (get().loop) {
          playTrackByIndex(0);
        }
      }
    },

    playPrevious: () => {
      const { playlist, currentIndex } = get();
      if (playlist && playlist.length > 0 && currentIndex > 0) {
        playTrackByIndex(currentIndex - 1);
      } else if (get().loop && currentIndex === 0) {
        playTrackByIndex(playlist.length - 1);
      }
    },
  };
});
