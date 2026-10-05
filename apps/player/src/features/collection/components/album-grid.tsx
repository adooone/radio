import type { Album } from '@radio/types';
import { AlbumCard } from './album-card';

type AlbumGridProps = {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
};

export const AlbumGrid = ({ albums, onAlbumClick }: AlbumGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          onClick={() => onAlbumClick(album)}
        />
      ))}
    </div>
  );
};
