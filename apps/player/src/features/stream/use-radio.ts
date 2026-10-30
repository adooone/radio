import Hls from 'hls.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { streamUrl } from '@/lib/env';
import { type RadioStatus, nextStatus } from './radio-state';

/** How long the quiet air rests before the engine knocks on the manifest again. */
const RETRY_MS = 15_000;

/**
 * The player's engine: hls.js where MSE exists, the native pipeline on
 * Safari. Nothing downloads until the listener presses play; a dead or
 * 404ing manifest turns the status offline, and a timer opens the stream
 * anew, so the page comes back to life by itself when the air returns.
 */
export const useRadio = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<RadioStatus>('loading');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
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
      video.pause();
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
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () =>
          setStatus((s) => nextStatus(s, 'manifest')),
        );
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) quiet();
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        const alive = () => setStatus((s) => nextStatus(s, 'manifest'));
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', alive);
        video.addEventListener('error', quiet);
        closeNative = () => {
          video.removeEventListener('loadedmetadata', alive);
          video.removeEventListener('error', quiet);
          video.removeAttribute('src');
          video.load();
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
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.volume = volume;
  }, [volume]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      // Join (and rejoin) at the live edge rather than resuming the past.
      hlsRef.current?.startLoad(-1);
      video.play().catch(() => {});
    } else {
      video.pause();
      hlsRef.current?.stopLoad();
    }
  }, []);

  return { videoRef, status, playing, toggle, volume, setVolume };
};
