import { useCreateDraft } from '@/services/api';
import { Button, Input, Modal } from '@dendelion/mojo-ui';
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
    <Modal isOpen onClose={onClose} title="Новий запис" maxWidth="max-w-xl">
      {createdSlug ? (
        <div className={clsx(styles.form)}>
          <p className={clsx(styles.hint)}>
            Драфт {createdSlug} створено. Завантажте side-*.wav:
          </p>
          <UploadSection slug={createdSlug} />
          <div className={clsx(styles.actions)}>
            <Button
              type="button"
              variant="dark"
              size="medium"
              title="Готово"
              onClick={onClose}
            />
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
            <Button
              type="button"
              variant="gray"
              size="medium"
              title="Скасувати"
              onClick={onClose}
            />
            <Button
              type="submit"
              variant="dark"
              size="medium"
              title={createDraft.isPending ? 'Створення...' : 'Створити'}
              disabled={
                createDraft.isPending || !artist.trim() || !album.trim()
              }
            />
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
