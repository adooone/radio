import { useCreateDraft } from '@/services/api';
import { Input, LampButton, Modal } from '@dendelion/func-ui';
import clsx from 'clsx';
import { useState } from 'react';
import { slugify } from './slugify';
import { getErrorMessage } from './split-review/split-review-utils';
import { UploadSection } from './upload-section';

type CreateDraftModalProps = {
  onClose: () => void;
};

export const CreateDraftModal = ({ onClose }: CreateDraftModalProps) => {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const createDraft = useCreateDraft();

  const slugPreview =
    artist.trim() && album.trim() ? `${slugify(artist)}_${slugify(album)}` : '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!artist.trim() || !album.trim()) return;
    try {
      const draft = await createDraft.mutateAsync({
        artist: artist.trim(),
        album: album.trim(),
      });
      setCreatedSlug(draft.slug);
    } catch {
      // handled below via createDraft.isError
    }
  };

  return (
    <Modal open onClose={onClose} title="Новий запис" size="md">
      {createdSlug ? (
        <div className={clsx(styles.form)}>
          <p className={clsx(styles.hint)}>
            Драфт {createdSlug} створено. Завантажте side-*.wav:
          </p>
          <UploadSection slug={createdSlug} />
          <div className={clsx(styles.actions)}>
            <LampButton type="button" tone="dark" size="md" onClick={onClose}>
              Готово
            </LampButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={clsx(styles.form)}>
          <Input
            label="Виконавець"
            value={artist}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setArtist(event.target.value)
            }
            required
          />
          <Input
            label="Альбом"
            value={album}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setAlbum(event.target.value)
            }
            required
          />
          {slugPreview && (
            <p className={clsx(styles.hint)}>Папка інбоксу: {slugPreview}</p>
          )}
          {createDraft.isError && (
            <p className={clsx(styles.error)}>
              {getErrorMessage(createDraft.error)}
            </p>
          )}
          <div className={clsx(styles.actions)}>
            <LampButton type="button" tone="gray" size="md" onClick={onClose}>
              Скасувати
            </LampButton>
            <LampButton
              type="submit"
              tone="dark"
              size="md"
              disabled={
                createDraft.isPending || !artist.trim() || !album.trim()
              }
            >
              {createDraft.isPending ? 'Створення...' : 'Створити'}
            </LampButton>
          </div>
        </form>
      )}
    </Modal>
  );
};

const styles = {
  form: ['flex flex-col gap-4'],
  hint: ['text-sm text-gray-400'],
  error: ['text-sm text-red-400'],
  actions: ['flex justify-end gap-3 pt-2'],
} as const;
