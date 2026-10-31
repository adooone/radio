import { collectionApi } from '@/services/api';
import { useNowPlayingStore } from '@/stores/now-playing-store';
import { LampStatus } from '@dendelion/func-ui';
import type { Song } from '@radio/types';

type SongItemProps = {
  song: Song & { audioFilePath?: string; audioFileName?: string };
  playlist: Array<{ title: string; artist: string; audioUrl?: string }>;
  playlistIndex: number;
  onDelete: (songId: number, title: string) => void;
  isDeleting: boolean;
  isOnAir: boolean;
  onSetOnAir: () => void;
  isSettingOnAir: boolean;
};

export const SongItem = ({
  song,
  playlist,
  playlistIndex,
  onDelete,
  isDeleting,
  isOnAir,
  onSetOnAir,
  isSettingOnAir,
}: SongItemProps) => {
  const { currentTrack, isPlaying, playTrack } = useNowPlayingStore();

  const isCurrentTrack =
    currentTrack?.audioUrl === song.audioUrl && !!song.audioUrl;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    if (song.audioUrl && playlistIndex >= 0) {
      playTrack(playlist, playlistIndex);
    }
  };

  const handleOpenInNewTab = () => {
    const url = collectionApi.getAudioFileStreamUrl(song.audioFileId);
    window.open(url, '_blank');
  };

  return (
    <div
      className={`px-4 py-2 rounded-full transition-all ${
        isCurrentTrack
          ? 'bg-sun/10 border border-sun/20'
          : 'hover:bg-gray-800/50 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Play/pause button only when playing, track number otherwise */}
        {isThisPlaying ? (
          <button
            type="button"
            onClick={handlePlay}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-ember text-stone-900"
            title="Pause"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            disabled={!song.audioUrl || playlistIndex < 0}
            className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              song.audioUrl && playlistIndex >= 0
                ? 'Play'
                : 'No audio available'
            }
          >
            {song.position ?? song.trackNumber}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium truncate ${isCurrentTrack ? 'text-sun' : 'text-gray-200'}`}
          >
            {song.title}
          </h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            {song.artist && <span className="truncate">{song.artist}</span>}
            {song.duration && <span>{song.duration}</span>}
            <span>{song.format.toUpperCase()}</span>
            {song.fileSlug && (
              <span className="text-gray-600 truncate" title={song.fileSlug}>
                {song.fileSlug}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOnAir ? (
            <LampStatus status="running" label="В ефірі" />
          ) : (
            <button
              type="button"
              onClick={onSetOnAir}
              disabled={isSettingOnAir}
              className="p-2 text-gray-400 hover:text-sun rounded transition-colors disabled:opacity-50"
              title="Поставити в ефір"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="p-2 text-gray-400 hover:text-sun rounded transition-colors"
            title="Open in new tab"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(song.id, song.title)}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-400 rounded transition-colors disabled:opacity-50"
            title="Remove from album"
          >
            {isDeleting ? (
              <span className="text-xs">...</span>
            ) : (
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
