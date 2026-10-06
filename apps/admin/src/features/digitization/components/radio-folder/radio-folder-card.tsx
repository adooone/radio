import { useCreateDraft } from '@/services/api';
import { Button } from '@dendelion/mojo-ui';
import clsx from 'clsx';
import { useState } from 'react';
import { getErrorMessage } from '../split-review/split-review-utils';
import { UploadTaskList } from '../upload-section';
import { useBeforeUnloadWhileUploading } from '../use-before-unload-while-uploading';
import { useUploadManager } from '../use-upload-manager';
import type { RadioFolder } from './scan-radio-folder';

type RadioFolderCardProps = {
  folder: RadioFolder;
};

export const RadioFolderCard = ({ folder }: RadioFolderCardProps) => {
  const [started, setStarted] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createDraft = useCreateDraft();
  const { tasks, addFiles, pause, resume, retry, isUploading } =
    useUploadManager(folder.slug);

  useBeforeUnloadWhileUploading(isUploading);

  const handleUpload = async () => {
    setStarted(true);
    setCreateError(null);
    try {
      await createDraft.mutateAsync({ slug: folder.slug });
      const files = await Promise.all(
        folder.files.map((entry) => entry.handle.getFile()),
      );
      addFiles(files);
    } catch (error) {
      setStarted(false);
      setCreateError(getErrorMessage(error));
    }
  };

  return (
    <li className={clsx(styles.card)}>
      <div className={clsx(styles.row)}>
        <p className={clsx(styles.slug)}>{folder.slug}</p>
        <p className={clsx(styles.count)}>
          {folder.files.length} {pluralizeFiles(folder.files.length)}
        </p>
        <Button
          type="button"
          variant="dark"
          size="small"
          title={started ? 'Завантажується...' : 'Завантажити'}
          disabled={started || createDraft.isPending}
          onClick={handleUpload}
        />
      </div>
      {createError && <p className={clsx(styles.error)}>{createError}</p>}
      {tasks.length > 0 && (
        <UploadTaskList
          tasks={tasks}
          onPause={pause}
          onResume={resume}
          onRetry={retry}
        />
      )}
    </li>
  );
};

function pluralizeFiles(count: number): string {
  if (count === 1) return 'файл';
  if (count >= 2 && count <= 4) return 'файли';
  return 'файлів';
}

const styles = {
  card: ['flex flex-col gap-2 p-3 rounded-lg bg-gray-800/30'],
  row: ['flex items-center gap-3'],
  slug: ['flex-1 font-mono text-sm text-gray-200 truncate'],
  count: ['text-xs text-gray-400 whitespace-nowrap'],
  error: ['text-sm text-red-400'],
} as const;
