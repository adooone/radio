import { type AlbumWithSongs, albumApi } from '@/services/api/album-api';
import type { Album } from '@radio/types';
import { useEffect, useState } from 'react';
import { AlbumDetailModal } from './components/album-detail-modal';
import { AlbumGrid } from './components/album-grid';
import { FilterBar } from './components/filter-bar';

export const CollectionLayout = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithSongs | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    artist: '',
    year: undefined as number | undefined,
    tags: [] as string[],
    sortBy: 'date' as 'date' | 'artist' | 'year' | 'title',
  });

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    let filtered = [...albums];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (album) =>
          album.title.toLowerCase().includes(search) ||
          album.artist.toLowerCase().includes(search),
      );
    }

    if (filters.artist) {
      filtered = filtered.filter((album) =>
        album.artist.toLowerCase().includes(filters.artist.toLowerCase()),
      );
    }

    if (filters.year) {
      filtered = filtered.filter((album) => album.year === filters.year);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((album) => {
        if (!album.tags) return false;
        const albumTags = JSON.parse(album.tags);
        return filters.tags.some((tag) => albumTags.includes(tag));
      });
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    setFilteredAlbums(filtered);
  }, [albums, filters]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await albumApi.getPublicAlbums();
      setAlbums(data);
    } catch (error) {
      console.error('Failed to load albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumClick = async (album: Album) => {
    try {
      const albumWithSongs = await albumApi.getAlbumById(album.id);
      setSelectedAlbum(albumWithSongs);
    } catch (error) {
      console.error('Failed to load album details:', error);
    }
  };

  return (
    <div className="w-full h-full bg-neutral-900/50 flex flex-col items-center justify-start text-neutral-100 p-4 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-neutral-100 mb-4 font-['Ponomar']">
            Vinyl Collection
          </h1>
          <p className="text-lg text-neutral-400">
            Explore our curated collection of albums
          </p>
        </header>

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          albums={albums}
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
            {Array.from({ length: 10 }, (_, i) => `s${i}`).map((id) => (
              <div
                key={id}
                className="aspect-square bg-neutral-800/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-semibold text-neutral-200 mb-2">
              No albums found
            </h3>
            <p className="text-neutral-400">
              Try adjusting your filters or search term
            </p>
          </div>
        ) : (
          <AlbumGrid albums={filteredAlbums} onAlbumClick={handleAlbumClick} />
        )}
      </div>

      {selectedAlbum && (
        <AlbumDetailModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
        />
      )}
    </div>
  );
};
