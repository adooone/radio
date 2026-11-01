import { FilmOverlay } from '@/features/film/film-overlay';
import { PlayerPage } from '@/features/player/player-page';
import { translate, useLocale } from '@/i18n';
import { useEffect } from 'react';

export const App = () => {
  const [locale] = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, 'meta.title');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', translate(locale, 'meta.description'));
  }, [locale]);

  return (
    <>
      <PlayerPage />
      <FilmOverlay />
    </>
  );
};
