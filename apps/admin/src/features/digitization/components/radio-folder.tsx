import { Chip, Dot } from '@/features/admin/ui';
import { useCreateDraft } from '@/services/api';
import { Button } from '@dendelion/func-ui';
import type { DigitizationDraft } from '@radio/types';
import { useMemo, useState } from 'react';
import { useBeforeUnloadWhileUploading } from '../hooks/use-before-unload-while-uploading';
import { useRadioFolder } from '../hooks/use-radio-folder';
import { useUploadManager } from '../hooks/use-upload-manager';
import type { RadioFolder as Folder } from '../lib/scan-radio-folder';
import { getErrorMessage } from '../lib/split-review-utils';
import { filesCount } from '../lib/stages';
import { UploadTasks } from './upload-zone';

/** One record folder on the disk: its name, what it holds, and the way in. */
const FolderRow = ({
  folder,
  draft,
}: { folder: Folder; draft?: DigitizationDraft }) => {
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createDraft = useCreateDraft();
  const { tasks, addFiles, pause, resume, retry, isUploading } =
    useUploadManager(folder.slug);

  useBeforeUnloadWhileUploading(isUploading);

  const missing = draft
    ? folder.files.filter((entry) => !draft.sides.includes(entry.name))
    : folder.files;

  const upload = async () => {
    setStarted(true);
    setError(null);
    try {
      if (!draft) await createDraft.mutateAsync({ slug: folder.slug });
      const files = await Promise.all(
        missing.map((entry) => entry.handle.getFile()),
      );
      addFiles(files);
    } catch (err) {
      setStarted(false);
      setError(getErrorMessage(err));
    }
  };

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-cream">
          {folder.slug}
        </span>
        <span className="type-meta shrink-0 text-cream/60">
          {filesCount(folder.files.length)}
        </span>
        {draft && <Chip tone="quiet">у драфтах</Chip>}
        {missing.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            disabled={started || createDraft.isPending}
            onClick={upload}
          >
            {started
              ? 'Надсилання…'
              : draft
                ? `Додати ${filesCount(missing.length)}`
                : 'Завантажити'}
          </Button>
        )}
      </div>
      {error && <p className="font-sans text-xs text-accent">{error}</p>}
      {tasks.length > 0 && (
        <UploadTasks
          tasks={tasks}
          onPause={pause}
          onResume={resume}
          onRetry={retry}
        />
      )}
    </li>
  );
};

/**
 * The radio folder, at the foot of the slab: the recording folder on this
 * machine, read with the File System Access API, with the records it holds
 * that are not yet in the inbox.
 */
export const RadioFolder = ({ drafts }: { drafts: DigitizationDraft[] }) => {
  const folder = useRadioFolder();
  const bySlug = useMemo(() => {
    const map = new Map<string, DigitizationDraft>();
    for (const draft of drafts) map.set(draft.slug, draft);
    return map;
  }, [drafts]);

  const granted = Boolean(folder.handle) && folder.permission === 'granted';
  const fresh = folder.folders.filter((item) => !bySlug.has(item.slug)).length;

  const status = !folder.supported
    ? 'цей браузер не читає теки — перетягніть файли у драфт'
    : !folder.handle
      ? 'не вибрана'
      : folder.permission !== 'granted'
        ? `${folder.handle.name} · потрібен доступ`
        : folder.isScanning
          ? `${folder.handle.name} · читання…`
          : `${folder.handle.name} · ${fresh > 0 ? `нових записів: ${fresh}` : 'нових записів немає'}`;

  return (
    <div className="flex flex-col gap-3">
      <span className="type-label flex items-center gap-2 text-cream/60">
        <Dot tone={granted ? 'lit' : 'quiet'} />
        Папка радіо
      </span>
      <span className="font-sans text-[13px] text-cream/75">{status}</span>
      {folder.error && (
        <p className="font-sans text-xs text-accent">{folder.error}</p>
      )}

      {folder.supported && (
        <div className="flex flex-wrap gap-2">
          {folder.handle && folder.permission !== 'granted' && (
            <Button variant="lit" size="sm" onClick={folder.grantAccess}>
              Надати доступ
            </Button>
          )}
          {granted && (
            <Button
              variant="ghost"
              size="sm"
              disabled={folder.isScanning}
              onClick={folder.refresh}
            >
              Сканувати
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={folder.choose}>
            {folder.handle ? 'Змінити теку' : 'Вибрати теку'}
          </Button>
          {folder.handle && (
            <Button variant="secondary" size="sm" onClick={folder.forget}>
              Забути
            </Button>
          )}
        </div>
      )}

      {granted && !folder.isScanning && folder.folders.length > 0 && (
        <ul className="flex flex-col gap-3 pt-1">
          {folder.folders.map((item) => (
            <FolderRow
              key={item.slug}
              folder={item}
              draft={bySlug.get(item.slug)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
