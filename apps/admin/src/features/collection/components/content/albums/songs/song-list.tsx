import { useDeleteSong } from '@/services/api';
import type { Song } from '@radio/types';
import { useState } from 'react';
import { SongItem } from './song-item';

type SongListProps = {
  albumId: number;
  songs: (Song & { audioFilePath?: string; audioFileName?: string })[];
};

export const SongList = ({ songs }: SongListProps) => {
  const deleteSong = useDeleteSong();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (songId: number, title: string) => {
    if (!confirm(`Remove "${title}" from this album?`)) return;

    try {
      setDeletingId(songId);
      await deleteSong.mutateAsync(songId);
    } catch (error) {
      console.error('Failed to delete song:', error);
      alert('Failed to delete song');
    } finally {
      setDeletingId(null);
    }
  };

  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No songs in this album yet.
      </div>
    );
  }

  const sortedSongs = [...songs].sort((a, b) => a.trackNumber - b.trackNumber);

  // Convert songs to playlist format and create a map of song audioUrl to playlist index
  const playlist: Array<{ title: string; artist: string; audioUrl?: string }> =
    [];
  const songToPlaylistIndex = new Map<string, number>();

  for (const song of sortedSongs) {
    if (song.audioUrl) {
      const playlistIndex = playlist.length;
      playlist.push({
        title: song.title,
        artist: song.artist || '',
        audioUrl: song.audioUrl || undefined,
      });
      songToPlaylistIndex.set(song.audioUrl, playlistIndex);
    }
  }

  return (
    <div>
      {sortedSongs.map((song) => {
        const playlistIndex = song.audioUrl
          ? (songToPlaylistIndex.get(song.audioUrl) ?? -1)
          : -1;

        return (
          <SongItem
            key={song.id}
            song={song}
            playlist={playlist}
            playlistIndex={playlistIndex}
            onDelete={handleDelete}
            isDeleting={deletingId === song.id}
          />
        );
      })}
    </div>
  );
};
