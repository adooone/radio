import {
  collectionApi,
  useCollection,
  useRemoveItemFromCollection,
} from '@/services/api';
import { Stamp } from '@dendelion/func-ui';
import type { Collection } from '@radio/types';
import { plural } from '../lib/album-meta';

/** The open playlist on the slab: its lines and its tracks. */
export const PlaylistDetail = ({ playlist }: { playlist: Collection }) => {
  const { data, isLoading } = useCollection(playlist.id);
  const removeItem = useRemoveItemFromCollection();

  const remove = async (audioFileId: number, name: string) => {
    if (!confirm(`Прибрати «${name}» з плейлиста?`)) return;
    try {
      await removeItem.mutateAsync({ collectionId: playlist.id, audioFileId });
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-serif text-[26px] font-extrabold leading-[1.15] text-cream">
          {data?.name ?? playlist.name}
        </h2>
        {(data?.description ?? playlist.description) && (
          <p className="type-body text-cream/70">
            {data?.description ?? playlist.description}
          </p>
        )}
        <p className="flex items-center gap-3 font-sans text-[13px] text-cream/60">
          <Stamp variant={playlist.isPublic ? 'warning' : 'neutral'}>
            {playlist.isPublic ? 'публічний' : 'приватний'}
          </Stamp>
          <span>{plural(items.length, ['трек', 'треки', 'треків'])}</span>
          <span>
            створено {new Date(playlist.createdAt).toLocaleDateString('uk-UA')}
          </span>
        </p>
      </div>

      {isLoading ? (
        <p className="type-body text-cream/45">Завантаження…</p>
      ) : items.length === 0 ? (
        <p className="type-body text-cream/45">У плейлисті ще немає треків.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-[14px] border border-cream/[0.08] px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate font-serif text-base font-semibold text-cream">
                {item.name}
              </span>
              <span className="type-meta shrink-0 text-cream/60">
                {item.duration ? `${item.duration} · ` : ''}
                {item.format.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    collectionApi.getAudioFileStreamUrl(item.audioFileId),
                    '_blank',
                  )
                }
                className="type-label shrink-0 text-cream/45 transition-colors hover:text-cream"
              >
                файл
              </button>
              <button
                type="button"
                onClick={() => remove(item.audioFileId, item.name)}
                disabled={removeItem.isPending}
                aria-label="Прибрати трек"
                className="shrink-0 px-1 text-cream/45 transition-colors hover:text-accent"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
