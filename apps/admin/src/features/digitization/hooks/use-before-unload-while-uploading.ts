import { useEffect } from 'react';

export const useBeforeUnloadWhileUploading = (isUploading: boolean) => {
  useEffect(() => {
    if (!isUploading) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isUploading]);
};
