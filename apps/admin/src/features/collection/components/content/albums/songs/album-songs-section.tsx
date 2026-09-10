import { Button } from '@dendelion/mojo-ui';
import { SongList } from './song-list';
import type { Song } from '@radio/types';

type AlbumSongsSectionProps = {
  albumId: number;
  songs: (Song & { audioFilePath?: string; audioFileName?: string })[] | null;
  onAddSong: () => void;
};

export const AlbumSongsSection = ({
  albumId,
  songs,
  onAddSong,
}: AlbumSongsSectionProps) => {
  return (
    <div className="border-t border-gray-700/50 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Songs</h3>
        <Button
          variant="yellow"
          size="small"
          title="Add Song"
          onClick={onAddSong}
        />
      </div>

      <SongList albumId={albumId} songs={songs || []} />
    </div>
  );
};
