import { Pill } from '@/features/admin/ui';
import { useCreateCollection } from '@/services/api';
import { Input, Textarea } from '@dendelion/func-ui';
import { useState } from 'react';

/** A new playlist, made on the slab. */
export const PlaylistForm = ({ onDone }: { onDone: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateCollection();

  const submit = async () => {
    if (!name.trim()) return;
    setError(null);
    try {
      await create.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      onDone();
    } catch (err) {
      console.error('Failed to create collection:', err);
      setError('Не вдалося створити плейлист.');
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-5"
    >
      <span className="type-label text-cream/60">Новий плейлист</span>
      <Input
        label="Назва"
        id="playlist-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Textarea
        label="Опис"
        id="playlist-description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label className="flex items-center gap-3 type-ui text-cream/70">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="size-4 accent-[#ff5647]"
        />
        Публічний плейлист
      </label>
      {error && <p className="font-sans text-xs text-accent">{error}</p>}
      <div className="flex gap-2.5">
        <Pill
          type="submit"
          tone="lit"
          size="sm"
          disabled={!name.trim() || create.isPending}
        >
          {create.isPending ? 'Створення…' : 'Створити'}
        </Pill>
        <Pill
          tone="ghost"
          size="sm"
          disabled={create.isPending}
          onClick={onDone}
        >
          Скасувати
        </Pill>
      </div>
    </form>
  );
};
