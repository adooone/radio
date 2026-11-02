import { useCollectionStore } from '../../store/collection-store';
import { AlbumDetail } from '../content/albums';

export const AlbumPane = () => {
  const { selectedAlbum } = useCollectionStore();

  if (!selectedAlbum) {
    return (
      <p className="font-serif text-lg text-cream/45">
        Оберіть альбом зі списку, щоб побачити його деталі.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl text-cream">{selectedAlbum.title}</h2>
      <AlbumDetail key={selectedAlbum.id} album={selectedAlbum} />
    </section>
  );
};
