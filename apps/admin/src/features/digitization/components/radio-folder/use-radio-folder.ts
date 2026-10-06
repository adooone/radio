import { useCallback, useEffect, useState } from 'react';
import {
  clearStoredRadioFolderHandle,
  getStoredRadioFolderHandle,
  setStoredRadioFolderHandle,
} from './idb-handle-store';
import { type RadioFolder, scanRadioFolder } from './scan-radio-folder';

export const isFileSystemAccessSupported =
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

export type RadioFolderPermission = 'granted' | 'prompt' | 'denied' | 'none';

export const useRadioFolder = () => {
  const [handle, setHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [permission, setPermission] = useState<RadioFolderPermission>('none');
  const [folders, setFolders] = useState<RadioFolder[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (dirHandle: FileSystemDirectoryHandle) => {
    setIsScanning(true);
    setError(null);
    try {
      setFolders(await scanRadioFolder(dirHandle));
    } catch {
      setError('Не вдалося прочитати теку.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    if (!isFileSystemAccessSupported) return;
    (async () => {
      const stored = await getStoredRadioFolderHandle();
      if (!stored) return;
      setHandle(stored);
      const state =
        (await stored.queryPermission?.({ mode: 'read' })) ?? 'prompt';
      setPermission(state);
      if (state === 'granted') await scan(stored);
    })();
  }, [scan]);

  const choose = useCallback(async () => {
    if (!isFileSystemAccessSupported) return;
    try {
      const picked = await window.showDirectoryPicker?.({
        id: 'radio-folder',
        mode: 'read',
      });
      if (!picked) return;
      await setStoredRadioFolderHandle(picked);
      setHandle(picked);
      setPermission('granted');
      await scan(picked);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError('Не вдалося вибрати теку.');
    }
  }, [scan]);

  const grantAccess = useCallback(async () => {
    if (!handle) return;
    const state =
      (await handle.requestPermission?.({ mode: 'read' })) ?? 'denied';
    setPermission(state);
    if (state === 'granted') await scan(handle);
  }, [handle, scan]);

  const forget = useCallback(async () => {
    await clearStoredRadioFolderHandle();
    setHandle(null);
    setPermission('none');
    setFolders([]);
  }, []);

  const refresh = useCallback(() => {
    if (handle) scan(handle);
  }, [handle, scan]);

  return {
    supported: isFileSystemAccessSupported,
    handle,
    permission,
    folders,
    isScanning,
    error,
    choose,
    grantAccess,
    forget,
    refresh,
  };
};
