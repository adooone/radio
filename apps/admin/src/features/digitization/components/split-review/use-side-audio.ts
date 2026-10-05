import { digitizationApi } from '@/services/api/digitization-api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from './split-review-utils';

const PRE_ROLL_SECONDS = 1;
const AUDITION_WINDOW_SECONDS = 4;
const WAV_HEADER_PROBE_BYTES = 4096;

interface WavFormat {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  dataOffset: number;
  dataSize: number;
}

function writeAsciiString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function parseWavFormat(buffer: ArrayBuffer): WavFormat {
  const view = new DataView(buffer);
  let offset = 12;
  let fmt:
    | Pick<WavFormat, 'channels' | 'sampleRate' | 'bitsPerSample'>
    | undefined;
  let data: { offset: number; size: number } | undefined;

  while (offset + 8 <= buffer.byteLength) {
    const id = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3),
    );
    const size = view.getUint32(offset + 4, true);
    const bodyOffset = offset + 8;
    if (id === 'fmt ') {
      fmt = {
        channels: view.getUint16(bodyOffset + 2, true),
        sampleRate: view.getUint32(bodyOffset + 4, true),
        bitsPerSample: view.getUint16(bodyOffset + 14, true),
      };
    } else if (id === 'data') {
      data = { offset: bodyOffset, size };
      break;
    }
    offset = bodyOffset + size + (size % 2);
  }

  if (!fmt || !data) {
    throw new Error('Unsupported WAV format');
  }
  return { ...fmt, dataOffset: data.offset, dataSize: data.size };
}

function buildWavBlob(pcm: ArrayBuffer, format: WavFormat): Blob {
  const blockAlign = format.channels * (format.bitsPerSample / 8);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  writeAsciiString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm.byteLength, true);
  writeAsciiString(view, 8, 'WAVE');
  writeAsciiString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, format.channels, true);
  view.setUint32(24, format.sampleRate, true);
  view.setUint32(28, format.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, format.bitsPerSample, true);
  writeAsciiString(view, 36, 'data');
  view.setUint32(40, pcm.byteLength, true);
  return new Blob([header, pcm], { type: 'audio/wav' });
}

export const useSideAudio = (slug: string, file: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const formatRef = useRef<WavFormat | null>(null);
  const urlRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: slug/file intentionally re-trigger audio reset on track change
  useEffect(() => {
    audioRef.current = new Audio();
    formatRef.current = null;
    setError(null);
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [slug, file]);

  const audition = useCallback(
    async (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      setIsLoading(true);
      setError(null);
      try {
        if (!formatRef.current) {
          const headerBlob = await digitizationApi.getDraftAudio(
            slug,
            file,
            `bytes=0-${WAV_HEADER_PROBE_BYTES - 1}`,
          );
          formatRef.current = parseWavFormat(await headerBlob.arrayBuffer());
        }
        const format = formatRef.current;
        const blockAlign = format.channels * (format.bitsPerSample / 8);
        const byteRate = format.sampleRate * blockAlign;
        const startTime = Math.max(0, time - PRE_ROLL_SECONDS);
        const startByte =
          format.dataOffset +
          Math.floor((startTime * byteRate) / blockAlign) * blockAlign;
        const endByte = Math.min(
          format.dataOffset + format.dataSize - 1,
          startByte + Math.floor(AUDITION_WINDOW_SECONDS * byteRate),
        );

        const pcmBlob = await digitizationApi.getDraftAudio(
          slug,
          file,
          `bytes=${startByte}-${endByte}`,
        );
        const wavBlob = buildWavBlob(await pcmBlob.arrayBuffer(), format);

        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
        }
        const url = URL.createObjectURL(wavBlob);
        urlRef.current = url;
        audio.src = url;
        await audio.play();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [slug, file],
  );

  return { audition, isLoading, error };
};
