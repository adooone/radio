import { streamUrl } from '@/lib/env';
import Hls from 'hls.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type RadioStatus, nextStatus } from './radio-state';

/** How long the quiet air rests before the engine knocks on the manifest again. */
const RETRY_MS = 15_000;
/** Small analyser: 64 usable bins are plenty for the disc's halo. */
const FFT_SIZE = 256;

/**
 * The player's engine, audio-only: hls.js feeds a hidden audio element where
 * MSE exists (the stream's video track is simply never rendered), the native
 * pipeline takes over on Safari. Nothing downloads until the listener presses
 * play; a dead or 404ing manifest turns the status offline, and a timer opens
 * the stream anew, so the page comes back to life by itself when the air
 * returns. On the hls.js path a Web Audio analyser taps the element so the
 * vinyl halo can move with the actual sound.
 */
export const useRadio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelsRef = useRef<Uint8Array | null>(null);
  const wiredRef = useRef(false);
  const [status, setStatus] = useState<RadioStatus>('loading');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let hls: Hls | null = null;
    let retry = 0;
    let closeNative = () => {};

    const close = () => {
      hlsRef.current = null;
      hls?.destroy();
      hls = null;
      closeNative();
      closeNative = () => {};
    };

    /** The air went quiet: put the engine down and knock again in a while. */
    const quiet = () => {
      audio.pause();
      setStatus((s) => nextStatus(s, 'fatal'));
      close();
      window.clearTimeout(retry);
      retry = window.setTimeout(() => {
        setStatus((s) => nextStatus(s, 'retry'));
        open();
      }, RETRY_MS);
    };

    const open = () => {
      if (Hls.isSupported()) {
        // Segments load only once the listener presses play (startLoad in toggle).
        hls = new Hls({ autoStartLoad: false });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () =>
          setStatus((s) => nextStatus(s, 'manifest')),
        );
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) quiet();
        });
        return;
      }

      if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        const alive = () => setStatus((s) => nextStatus(s, 'manifest'));
        audio.src = streamUrl;
        audio.addEventListener('loadedmetadata', alive);
        audio.addEventListener('error', quiet);
        closeNative = () => {
          audio.removeEventListener('loadedmetadata', alive);
          audio.removeEventListener('error', quiet);
          audio.removeAttribute('src');
          audio.load();
        };
        return;
      }

      // Neither MSE nor native HLS: the air cannot reach this browser.
      quiet();
    };

    open();
    return () => {
      window.clearTimeout(retry);
      close();
    };
  }, []);

  // The element is the truth about playing, so outside pauses count too.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  /**
   * Tap the element once, on the first user gesture (an AudioContext started
   * earlier would sit suspended). MSE only: on native cross-origin HLS a
   * media-element source would silence the sound, so Safari keeps the
   * time-driven halo instead.
   */
  const wireAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || wiredRef.current || !hlsRef.current) return;
    wiredRef.current = true;
    try {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyser.connect(context.destination);
      analyserRef.current = analyser;
      context.resume().catch(() => {});
    } catch {
      analyserRef.current = null;
    }
  }, []);

  /** Current frequency levels (0–255), or null where Web Audio can't hear the stream. */
  const getLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return null;
    let levels = levelsRef.current;
    if (!levels || levels.length !== analyser.frequencyBinCount) {
      levels = new Uint8Array(analyser.frequencyBinCount);
      levelsRef.current = levels;
    }
    analyser.getByteFrequencyData(levels);
    return levels;
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      wireAnalyser();
      // Join (and rejoin) at the live edge rather than resuming the past.
      hlsRef.current?.startLoad(-1);
      audio.play().catch(() => {});
    } else {
      audio.pause();
      hlsRef.current?.stopLoad();
    }
  }, [wireAnalyser]);

  return { audioRef, status, playing, toggle, volume, setVolume, getLevels };
};
