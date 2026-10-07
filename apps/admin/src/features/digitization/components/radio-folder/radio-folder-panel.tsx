import { Button } from '@dendelion/mojo-ui';
import clsx from 'clsx';
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
        <div>
          <h2 className={clsx(styles.title)}>Тека Radio</h2>
          {handle && <p className={clsx(styles.path)}>{handle.name}</p>}
        </div>
        <div className={clsx(styles.actions)}>
          {handle && permission !== 'granted' && (
            <Button
              type="button"
              variant="dark"
              size="small"
              title="Надати доступ"
              onClick={grantAccess}
            />
          )}
          {handle && permission === 'granted' && (
            <Button
              type="button"
              variant="gray"
              size="small"
              title={isScanning ? 'Оновлення...' : 'Оновити'}
              disabled={isScanning}
              onClick={refresh}
            />
          )}
          <Button
            type="button"
            variant={handle ? 'gray' : 'dark'}
            size="small"
            title={handle ? 'Змінити теку' : 'Вибрати теку'}
            onClick={choose}
          />
          {handle && (
            <Button
              type="button"
              variant="gray"
              size="small"
              title="Забути"
              onClick={forget}
            />
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
              <RadioFolderCard key={folder.slug} folder={folder} />
            ))}
          </ul>
        ) : (
          <p className={clsx(styles.hint)}>У теці немає папок із side-*.wav.</p>
        ))}
    </div>
  );
};

const styles = {
  panel: ['flex flex-col gap-3 p-4 rounded-lg border border-gray-700'],
  header: ['flex items-start justify-between gap-3 flex-wrap'],
  title: ['font-medium text-gray-200'],
  path: ['text-xs text-gray-500 truncate max-w-[16rem]'],
  actions: ['flex items-center gap-2 flex-wrap'],
  list: ['flex flex-col gap-2'],
  hint: ['text-sm text-gray-400'],
  error: ['text-sm text-red-400'],
} as const;
