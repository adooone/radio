import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { streamUrl } from '@/services/env';

export const useStream = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamAvailable, setStreamAvailable] = useState(true);

  useEffect(() => {
    if (Hls && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStreamAvailable(true);
        videoRef.current?.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (
          data.type === Hls.ErrorTypes.NETWORK_ERROR ||
          data.details === 'manifestLoadError' ||
          data.fatal
        ) {
          setStreamAvailable(false);
        }
      });
      return () => hls.destroy();
    }

    if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
      videoRef.current.onerror = () => setStreamAvailable(false);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const handleEnded = () => setStreamAvailable(false);
    const handleError = () => setStreamAvailable(false);

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return { videoRef, streamAvailable };
};
