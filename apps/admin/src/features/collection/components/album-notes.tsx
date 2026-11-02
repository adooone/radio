import type { Album } from '@radio/types';
import type { ReactNode } from 'react';

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="type-label text-cream/45">{title}</span>
    <div className="flex flex-col gap-0.5 type-body text-cream/70">
      {children}
    </div>
  </div>
);

/** What the album's data.json told wave: who made the record and how. */
export const AlbumNotes = ({ album }: { album: Album }) => {
  const {
    recordingDetails,
    releaseInfo,
    personnel,
    production,
    visuals,
    additionalInfo,
  } = album;

  const hasRecording = Boolean(
    recordingDetails?.period ||
      recordingDetails?.location ||
      recordingDetails?.exceptions,
  );
  const hasRelease = Boolean(
    releaseInfo?.label ||
      releaseInfo?.distributor ||
      releaseInfo?.phonographic_copyright,
  );
  const hasProduction = Boolean(
    production?.engineer ||
      production?.producers?.length ||
      production?.coordination ||
      production?.thanks ||
      production?.mastering,
  );
  const hasVisuals = Boolean(
    visuals?.photography?.length || visuals?.design || visuals?.sleeve_printing,
  );

  if (
    !hasRecording &&
    !hasRelease &&
    !personnel?.length &&
    !hasProduction &&
    !hasVisuals &&
    !additionalInfo
  ) {
    return (
      <p className="font-serif text-sm italic text-cream/45">
        Покладіть <code className="rounded bg-cream/10 px-1 py-0.5">data.json</code>{' '}
        до теки альбому й натисніть «Оновити», щоб побачити учасників,
        продакшн та інше.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {hasRecording && recordingDetails && (
        <Block title="Запис">
          {recordingDetails.period && <p>Період: {recordingDetails.period}</p>}
          {recordingDetails.location && <p>Місце: {recordingDetails.location}</p>}
          {recordingDetails.exceptions && <p>{recordingDetails.exceptions}</p>}
        </Block>
      )}
      {hasRelease && releaseInfo && (
        <Block title="Видання">
          {releaseInfo.label && <p>Лейбл: {releaseInfo.label}</p>}
          {releaseInfo.distributor && (
            <p>Дистрибʼютор: {releaseInfo.distributor}</p>
          )}
          {releaseInfo.phonographic_copyright && (
            <p>{releaseInfo.phonographic_copyright}</p>
          )}
        </Block>
      )}
      {personnel && personnel.length > 0 && (
        <Block title="Учасники">
          {personnel.map((person) => (
            <p key={`${person.name}-${person.roles?.join(',') ?? ''}`}>
              {person.name}
              {person.roles?.length ? ` — ${person.roles.join(', ')}` : ''}
            </p>
          ))}
        </Block>
      )}
      {hasProduction && production && (
        <Block title="Продакшн">
          {production.engineer && <p>Звукорежисер: {production.engineer}</p>}
          {(production.producers?.length ?? 0) > 0 && (
            <p>Продюсери: {production.producers?.join(', ')}</p>
          )}
          {production.coordination && (
            <p>Координація: {production.coordination}</p>
          )}
          {production.mastering && <p>Мастеринг: {production.mastering}</p>}
          {production.thanks && <p className="italic">{production.thanks}</p>}
        </Block>
      )}
      {hasVisuals && visuals && (
        <Block title="Оформлення">
          {(visuals.photography?.length ?? 0) > 0 && (
            <p>Фото: {visuals.photography?.join(', ')}</p>
          )}
          {visuals.design && <p>Дизайн: {visuals.design}</p>}
          {visuals.sleeve_printing && <p>Друк: {visuals.sleeve_printing}</p>}
        </Block>
      )}
      {additionalInfo && (
        <Block title="Нотатки">
          <p>{additionalInfo}</p>
        </Block>
      )}
    </div>
  );
};
