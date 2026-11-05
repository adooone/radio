import { Pill } from '@/features/admin/ui';
import { useCreateDraft } from '@/services/api';
import { Input } from '@dendelion/func-ui';
import { useState } from 'react';
import { slugify } from '../lib/slugify';
import { getErrorMessage } from '../lib/split-review-utils';

/** A new record, named on the slab; its folder opens for the sides next. */
export const NewDraft = ({
  onDone,
}: { onDone: (slug: string | null) => void }) => {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const createDraft = useCreateDraft();

  const slugPreview =
    artist.trim() && album.trim() ? `${slugify(artist)}_${slugify(album)}` : '';

  const submit = async () => {
    if (!artist.trim() || !album.trim()) return;
    try {
      const draft = await createDraft.mutateAsync({
        artist: artist.trim(),
        album: album.trim(),
      });
      onDone(draft.slug);
    } catch {
      // shown below from createDraft.error
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-4"
    >
      <span className="type-label text-cream/60">Новий запис</span>
      <Input
        label="Виконавець"
        id="draft-artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        required
      />
      <Input
        label="Альбом"
        helperText={slugPreview ? `тека інбоксу: ${slugPreview}` : undefined}
        id="draft-album"
        value={album}
        onChange={(e) => setAlbum(e.target.value)}
        required
      />
      {createDraft.isError && (
        <p className="font-sans text-xs text-accent">
          {getErrorMessage(createDraft.error)}
        </p>
      )}
      <div className="flex gap-2.5">
        <Pill
          type="submit"
          tone="lit"
          size="sm"
          disabled={createDraft.isPending || !artist.trim() || !album.trim()}
        >
          {createDraft.isPending ? 'Створення…' : 'Створити'}
        </Pill>
        <Pill tone="ghost" size="sm" onClick={() => onDone(null)}>
          Скасувати
        </Pill>
      </div>
    </form>
  );
};
