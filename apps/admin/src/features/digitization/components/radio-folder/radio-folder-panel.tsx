import { useDigitizationDrafts } from '@/services/api';
import { LampIconButton, Tooltip } from '@dendelion/func-ui';
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
              <LampIconButton
                type="button"
                tone="dark"
                size="sm"
                label="Надати доступ"
                icon={<KeyIcon />}
                onClick={grantAccess}
              />
            </Tooltip>
          )}
          {handle && permission === 'granted' && (
            <Tooltip content={isScanning ? 'Оновлення...' : 'Оновити'}>
              <LampIconButton
                type="button"
                tone="gray"
                size="sm"
                label="Оновити"
                icon={<RefreshIcon />}
                disabled={isScanning}
                onClick={refresh}
              />
            </Tooltip>
          )}
          <Tooltip content={handle ? 'Змінити теку' : 'Вибрати теку'}>
            <LampIconButton
              type="button"
              tone={handle ? 'gray' : 'dark'}
              size="sm"
              label={handle ? 'Змінити теку' : 'Вибрати теку'}
              icon={<FolderIcon />}
              onClick={choose}
            />
          </Tooltip>
          {handle && (
            <Tooltip content="Забути">
              <LampIconButton
                type="button"
                tone="gray"
                size="sm"
                label="Забути"
                icon={<TrashIcon />}
                onClick={forget}
              />
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
