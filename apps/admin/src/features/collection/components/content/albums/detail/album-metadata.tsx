import type {
  PersonnelItem,
  Production,
  RecordingDetails,
  ReleaseInfo,
  Visuals,
} from '@radio/types';

type AlbumMetadataProps = {
  title: string;
  artist: string;
  year?: number | null;
  releaseYear?: number | null;
  description?: string | null;
  tags: string[];
  songCount: number;
  createdAt: string;
  recordingDetails?: RecordingDetails | null;
  releaseInfo?: ReleaseInfo | null;
  personnel?: PersonnelItem[] | null;
  production?: Production | null;
  visuals?: Visuals | null;
  additionalInfo?: string | null;
};

function MetadataBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </h4>
      <div className="text-sm text-gray-300 space-y-1">{children}</div>
    </div>
  );
}

export const AlbumMetadata = ({
  title,
  artist,
  year,
  releaseYear,
  description,
  tags,
  songCount,
  createdAt,
  recordingDetails,
  releaseInfo,
  personnel,
  production,
  visuals,
  additionalInfo,
}: AlbumMetadataProps) => {
  return (
    <div className="flex-1">
      <h2 className="text-2xl font-bold text-gray-200">{title}</h2>
      <p className="text-lg text-gray-400 mt-1">{artist}</p>
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
        {year != null && <span>Recorded {year}</span>}
        {releaseYear != null && (
          <span>
            {year != null ? '·' : ''} Released {releaseYear}
          </span>
        )}
      </div>
      {description && <p className="text-gray-300 mt-3">{description}</p>}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-sun/20 text-sun border border-sun/30 text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {recordingDetails &&
        (recordingDetails.period ||
          recordingDetails.location ||
          recordingDetails.exceptions) && (
          <MetadataBlock title="Recording">
            {recordingDetails.period && (
              <p>Period: {recordingDetails.period}</p>
            )}
            {recordingDetails.location && (
              <p>Location: {recordingDetails.location}</p>
            )}
            {recordingDetails.exceptions && (
              <p>{recordingDetails.exceptions}</p>
            )}
          </MetadataBlock>
        )}

      {releaseInfo &&
        (releaseInfo.label ||
          releaseInfo.distributor ||
          releaseInfo.phonographic_copyright) && (
          <MetadataBlock title="Release">
            {releaseInfo.label && <p>Label: {releaseInfo.label}</p>}
            {releaseInfo.distributor && (
              <p>Distributor: {releaseInfo.distributor}</p>
            )}
            {releaseInfo.phonographic_copyright && (
              <p>{releaseInfo.phonographic_copyright}</p>
            )}
          </MetadataBlock>
        )}

      {personnel && personnel.length > 0 && (
        <MetadataBlock title="Personnel">
          {personnel.map((p) => (
            <p key={`${p.name}-${p.roles?.join(',') ?? ''}`}>
              {p.name}
              {p.roles?.length ? ` – ${p.roles.join(', ')}` : ''}
            </p>
          ))}
        </MetadataBlock>
      )}

      {production &&
        (production.engineer ||
          (production.producers?.length ?? 0) > 0 ||
          production.coordination ||
          production.thanks ||
          production.mastering) && (
          <MetadataBlock title="Production">
            {production.engineer && <p>Engineer: {production.engineer}</p>}
            {(production.producers?.length ?? 0) > 0 && (
              <p>Producers: {production.producers?.join(', ')}</p>
            )}
            {production.coordination && (
              <p>Coordination: {production.coordination}</p>
            )}
            {production.mastering && <p>Mastering: {production.mastering}</p>}
            {production.thanks && <p className="italic">{production.thanks}</p>}
          </MetadataBlock>
        )}

      {visuals &&
        ((visuals.photography?.length ?? 0) > 0 ||
          visuals.design ||
          visuals.sleeve_printing) && (
          <MetadataBlock title="Visuals">
            {(visuals.photography?.length ?? 0) > 0 && (
              <p>Photography: {visuals.photography?.join(', ')}</p>
            )}
            {visuals.design && <p>Design: {visuals.design}</p>}
            {visuals.sleeve_printing && (
              <p>Printing: {visuals.sleeve_printing}</p>
            )}
          </MetadataBlock>
        )}

      {additionalInfo && (
        <MetadataBlock title="Notes">
          <p>{additionalInfo}</p>
        </MetadataBlock>
      )}

      {!recordingDetails &&
        !releaseInfo &&
        !personnel?.length &&
        !production &&
        !visuals &&
        !additionalInfo && (
          <p className="mt-4 text-sm text-gray-500 italic">
            Add a{' '}
            <code className="px-1 py-0.5 rounded bg-gray-700">data.json</code>{' '}
            file to this album folder and run Sync to display personnel,
            production, and other metadata.
          </p>
        )}

      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm text-gray-500">{songCount} songs</span>
        <span className="text-sm text-gray-500">
          Created {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
