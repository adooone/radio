import { useDigitizationDrafts } from '@/services/api';
import { Tooltip } from '@dendelion/func-ui';
import { IconButton } from '@dendelion/mojo-ui';
import type { DigitizationDraft } from '@radio/types';
import clsx from 'clsx';
import { useMemo } from 'react';
import { FolderIcon, KeyIcon, RefreshIcon, TrashIcon } from './icons';
import { RadioFolderCard } from './radio-folder-card';
import { useRadioFolder } from './use-radio-folder';

export const RadioFolderPanel = () => {
  const {
    supported,
    handle,
    permission,
    folders,
    isScanning,
    error,
    choose,
    grantAccess,
    forget,
    refresh,
  } = useRadioFolder();
  const { data: drafts } = useDigitizationDrafts();

  const draftsBySlug = useMemo(() => {
    const map = new Map<string, DigitizationDraft>();
    for (const draft of drafts ?? []) map.set(draft.slug, draft);
    return map;
  }, [drafts]);

  if (!supported) {
    return (
      <div className={clsx(styles.panel)}>
        <h2 className={clsx(styles.title)}>Тека Radio</h2>
        <p className={clsx(styles.hint)}>
          Цей браузер не підтримує доступ до файлової системи. Перетягніть файли
          у драфт вручну або скопіюйте їх через rsync.
        </p>
      </div>
    );
  }

  return (
    <div className={clsx(styles.panel)}>
      <div className={clsx(styles.header)}>
        <div className={clsx(styles.titleBlock)}>
          <h2 className={clsx(styles.title)}>Тека Radio</h2>
          {handle && <p className={clsx(styles.path)}>{handle.name}</p>}
        </div>
        <div className={clsx(styles.actions)}>
          {handle && permission !== 'granted' && (
            <Tooltip content="Надати доступ">
              <IconButton
                type="button"
                variant="dark"
                size="small"
                aria-label="Надати доступ"
                onClick={grantAccess}
              >
                <KeyIcon />
              </IconButton>
            </Tooltip>
          )}
          {handle && permission === 'granted' && (
            <Tooltip content={isScanning ? 'Оновлення...' : 'Оновити'}>
              <IconButton
                type="button"
                variant="gray"
                size="small"
                aria-label="Оновити"
                disabled={isScanning}
                onClick={refresh}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip content={handle ? 'Змінити теку' : 'Вибрати теку'}>
            <IconButton
              type="button"
              variant={handle ? 'gray' : 'dark'}
              size="small"
              aria-label={handle ? 'Змінити теку' : 'Вибрати теку'}
              onClick={choose}
            >
              <FolderIcon />
            </IconButton>
          </Tooltip>
          {handle && (
            <Tooltip content="Забути">
              <IconButton
                type="button"
                variant="gray"
                size="small"
                aria-label="Забути"
                onClick={forget}
              >
                <TrashIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {error && <p className={clsx(styles.error)}>{error}</p>}

      {handle &&
        permission === 'granted' &&
        !isScanning &&
        (folders.length > 0 ? (
          <ul className={clsx(styles.list)}>
            {folders.map((folder) => (
              <RadioFolderCard
                key={folder.slug}
                folder={folder}
                draft={draftsBySlug.get(folder.slug)}
              />
            ))}
          </ul>
        ) : (
          <p className={clsx(styles.hint)}>У теці немає папок із side-*.wav.</p>
        ))}
    </div>
  );
};

const styles = {
  panel: ['flex flex-col gap-3 p-3 rounded-lg border border-gray-700'],
  header: ['flex items-start justify-between gap-2'],
  titleBlock: ['min-w-0'],
  title: ['font-medium text-sm text-gray-200'],
  path: ['text-xs text-gray-500 truncate max-w-[10rem]'],
  actions: ['flex items-center gap-1 shrink-0'],
  list: ['flex flex-col gap-2'],
  hint: ['text-sm text-gray-400'],
  error: ['text-sm text-red-400'],
} as const;
